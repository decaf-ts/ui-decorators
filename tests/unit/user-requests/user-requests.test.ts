/**
 * @module ui-decorators/tests/unit/user-requests/user-requests.test
 * @summary Backend unit tests for the Service-based User Request Resolution
 * Engine core (FR-1..FR-3, FR-5 backend): `@userRequest(reference)` metadata
 * registration, static `UserRequestHandler.getHandler`/`getMetadata`/`handle`
 * dispatch, the mocked rendering-engine facade, cancellation, error
 * propagation and the `user-data` fixture handler. The rendering-engine mock
 * and the fixture handler live in `./mocks` and `./fixtures` — test-only,
 * never exported from `src`.
 */

import { Metadata } from "@decaf-ts/decoration";
import { InternalError, ValidationError } from "@decaf-ts/db-decorators";
import { Context, ContextFlags, ContextualArgs } from "@decaf-ts/core";
import { Model } from "@decaf-ts/decorator-validation";
import {
  CancelledError,
  USER_REQUEST_KEY,
  UserRequestHandler,
  userRequest,
} from "../../../src/user-requests";
import type { UserRequest } from "../../../src/user-requests";
import { DecafComponent } from "../../../src/ui/DecafComponent";
import { UserDataUserRequestHandler as FixtureUserDataUserRequestHandler } from "./fixtures/user-data-handler";
import { MockRenderingEngine } from "./mocks/MockRenderingEngine";

/** Builds the modal component the engine hands to `getModal`. */
const componentFor = <T = unknown>(
  request: UserRequest<T>
): Partial<DecafComponent<Model>> =>
  ({ props: { request } }) as Partial<DecafComponent<Model>>;

describe("user-requests", () => {
  describe("FR-1: @userRequest('id') records a handler class resolved by id", () => {
    it("resolves the decorated class by id via the static methods", () => {
      @userRequest("fr1-hello")
      class HelloUserRequestHandler extends UserRequestHandler<string> {
        async handle(request: UserRequest<string>): Promise<string> {
          return `hello ${request.id}`;
        }
      }

      expect(UserRequestHandler.getHandler("fr1-hello")).toBe(
        HelloUserRequestHandler
      );
    });

    it("records the handler metadata (reference) readable via metadata and statics", () => {
      @userRequest("fr1-meta")
      class MetaUserRequestHandler extends UserRequestHandler<string> {
        async handle(request: UserRequest<string>): Promise<string> {
          return request.payload ?? "";
        }
      }

      expect(UserRequestHandler.getMetadata(MetaUserRequestHandler)).toEqual({
        reference: "fr1-meta",
      });
      expect(
        Metadata.get(MetaUserRequestHandler, USER_REQUEST_KEY)
      ).toEqual({ reference: "fr1-meta" });
    });

    it("returns undefined for an unregistered reference", () => {
      expect(UserRequestHandler.getHandler("fr1-missing")).toBeUndefined();
      expect(UserRequestHandler.getMetadata(class NotRegistered {})).toBeUndefined();
    });
  });

  describe("FR-2: UserRequestHandler.handle(request, renderingEngine) dispatches to the handler", () => {
    it("returns the handler result for a registered constructor", async () => {
      @userRequest("echo")
      class EchoUserRequestHandler extends UserRequestHandler<string> {
        async handle(request: UserRequest<string>): Promise<string> {
          return `echo:${request.payload as string}`;
        }
      }

      expect(UserRequestHandler.getHandler("echo")).toBe(
        EchoUserRequestHandler
      );

      const result = await UserRequestHandler.handle(
        { id: "req-1", type: "echo", payload: "pong" },
        new MockRenderingEngine<string>()
      );
      expect(result).toBe("echo:pong");
    });

    it("throws a decaf error when no handler is registered", async () => {
      await expect(
        UserRequestHandler.handle(
          { id: "req-3", type: "missing" },
          new MockRenderingEngine()
        )
      ).rejects.toThrow(InternalError);
    });
  });

  describe("FR-3: backend mock rendering-engine facade logs actions and delivers the driven response", () => {
    it("records calls to getToast, getModal, getSpinner and router", async () => {
      const facade = new MockRenderingEngine();
      await facade.getToast({ message: "hi", duration: 3000, position: "top" });
      await facade.getModal(componentFor({ id: "r1", type: "user-confirm" }));
      await facade.getSpinner({ message: "loading" });
      facade.router();

      const methods = facade.logActions().map((a) => a.method);
      expect(methods).toContain("getToast");
      expect(methods).toContain("getModal");
      expect(methods).toContain("getSpinner");
      expect(methods).toContain("router");
    });

    it("returns the mocked user response for the request type via the presented modal", async () => {
      @userRequest("user-confirm")
      class InputUserRequestHandler extends UserRequestHandler<{
        ok: boolean;
      }> {
        async handle(
          request: UserRequest<{ ok: boolean }>,
          ...args: ContextualArgs<Context<ContextFlags<any>>>
        ): Promise<{ ok: boolean }> {
          return this.getInput(request, ...args);
        }
      }

      const facade = new MockRenderingEngine<{ ok: boolean }>();
      expect(UserRequestHandler.getHandler("user-confirm")).toBe(
        InputUserRequestHandler
      );

      const pending = UserRequestHandler.handle(
        { id: "r2", type: "user-confirm" },
        facade
      );
      const modal = await facade.whenModal();
      expect(modal.request).toEqual({ id: "r2", type: "user-confirm" });
      await modal.confirm({ data: { ok: true } });

      await expect(pending).resolves.toEqual({ ok: true });
      expect(
        facade.logActions().some((a) => a.method === "modal.confirm")
      ).toBe(true);
    });

    it("supports function mocks invoked with the request", async () => {
      @userRequest("greeting")
      class GreetingUserRequestHandler extends UserRequestHandler<string> {
        async handle(
          request: UserRequest<string>,
          ...args: ContextualArgs<Context<ContextFlags<any>>>
        ): Promise<string> {
          return this.getInput(request, ...args);
        }
      }

      const facade = new MockRenderingEngine<string>();
      expect(UserRequestHandler.getHandler("greeting")).toBe(
        GreetingUserRequestHandler
      );

      const pending = UserRequestHandler.handle(
        { id: "r3", type: "greeting" },
        facade
      );
      const modal = await facade.whenModal();
      const greeting = (request: UserRequest<string>): string =>
        `hello ${request.id}`;
      await modal.confirm({ data: greeting(modal.request!) });

      await expect(pending).resolves.toBe("hello r3");
    });

    it("propagates a decaf error when the modal is driven to error", async () => {
      @userRequest("boom-input")
      class BoomInputUserRequestHandler extends UserRequestHandler<string> {
        async handle(
          request: UserRequest<string>,
          ...args: ContextualArgs<Context<ContextFlags<any>>>
        ): Promise<string> {
          return this.getInput(request, ...args);
        }
      }

      const facade = new MockRenderingEngine<string>();
      expect(UserRequestHandler.getHandler("boom-input")).toBe(
        BoomInputUserRequestHandler
      );

      const pending = UserRequestHandler.handle(
        { id: "r4", type: "boom-input" },
        facade
      );
      const modal = await facade.whenModal();
      modal.throwsOnConfirm(new ValidationError("invalid"));
      await modal.confirm();

      await expect(pending).rejects.toThrow(ValidationError);
      expect(
        facade.logActions().some((a) => a.method === "modal.confirm")
      ).toBe(true);
    });
  });

  describe("cancellation: cancel() mid-request rejects handle with CancelledError", () => {
    it("rejects the pending handle call", async () => {
      @userRequest("wait")
      class WaitUserRequestHandler extends UserRequestHandler<string> {
        async handle(
          request: UserRequest<string>,
          ...args: ContextualArgs<Context<ContextFlags<any>>>
        ): Promise<string> {
          return this.getInput(request, ...args);
        }
      }

      const facade = new MockRenderingEngine<string>();
      const handler = new WaitUserRequestHandler(facade);
      const ctx = await handler.context("user-request", {});
      const pending = handler.handle({ id: "req-5", type: "wait" }, ctx);

      await handler.cancel();
      await expect(pending).rejects.toBeInstanceOf(CancelledError);
    });
  });

  describe("erroring: a handler that throws a decaf error propagates it", () => {
    it("propagates the decaf error (not swallowed)", async () => {
      @userRequest("boom")
      class BoomUserRequestHandler extends UserRequestHandler<string> {
        async handle(request: UserRequest<string>): Promise<string> {
          void request;
          throw new ValidationError("boom");
        }
      }
      expect(UserRequestHandler.getHandler("boom")).toBe(BoomUserRequestHandler);

      await expect(
        UserRequestHandler.handle(
          { id: "req-6", type: "boom" },
          new MockRenderingEngine()
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("logCtx exposes log, ctx, ctxArgs plus the exact rendering-engine methods", () => {
    it("wraps the rendering engine methods for a plain call", async () => {
      @userRequest("logctx")
      class LogCtxUserRequestHandler extends UserRequestHandler<string> {
        async handle(
          request: UserRequest<string>,
          ...args: ContextualArgs<Context<ContextFlags<any>>>
        ): Promise<string> {
          const lc = await this.logCtx([request, ...args], this.handle, true);
          expect(lc.log).toBeDefined();
          expect(lc.ctx).toBeDefined();
          expect(lc.ctxArgs).toBeDefined();
          expect(typeof lc.modal).toBe("function");
          expect(typeof lc.toast).toBe("function");
          expect(typeof lc.spinner).toBe("function");
          expect(typeof lc.router).toBe("function");
          expect(
            (lc as unknown as { getModal?: unknown }).getModal
          ).toBeUndefined();
          expect(
            (lc as unknown as { getToast?: unknown }).getToast
          ).toBeUndefined();
          expect(
            (lc as unknown as { getSpinner?: unknown }).getSpinner
          ).toBeUndefined();
          expect(
            (lc as unknown as { alert?: unknown }).alert
          ).toBeUndefined();
          expect(
            (lc as unknown as { route?: unknown }).route
          ).toBeUndefined();
          await lc.toast({ message: "done", duration: 3000, position: "top" });
          await lc.spinner({ message: "working" });
          return "logged";
        }
      }

      const facade = new MockRenderingEngine<string>();
      expect(UserRequestHandler.getHandler("logctx")).toBe(
        LogCtxUserRequestHandler
      );
      const result = await UserRequestHandler.handle(
        { id: "req-7", type: "logctx" },
        facade
      );
      expect(result).toBe("logged");
      expect(facade.logActions().some((a) => a.method === "getToast")).toBe(
        true
      );
      expect(facade.logActions().some((a) => a.method === "getSpinner")).toBe(
        true
      );
    });
  });

  describe("FR-5 (backend): the user-data fixture handler runs through the mock facade", () => {
    it("records the fixture handler metadata resolved by the static methods", () => {
      expect(UserRequestHandler.getHandler("user-data")).toBe(
        FixtureUserDataUserRequestHandler
      );
      expect(
        UserRequestHandler.getMetadata(FixtureUserDataUserRequestHandler)
      ).toEqual({ reference: "user-data" });
    });

    it("normalizes mocked user data through the static dispatch", async () => {
      const facade = new MockRenderingEngine();

      const pending = UserRequestHandler.handle(
        { id: "req-8", type: "user-data" },
        facade
      );
      const modal = await facade.whenModal();
      await modal.confirm({
        data: { name: "  Ada Lovelace  ", email: "ADA@EXAMPLE.COM" },
      });

      await expect(pending).resolves.toEqual({
        name: "Ada Lovelace",
        email: "ada@example.com",
      });
    });
  });
});
