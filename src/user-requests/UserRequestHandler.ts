/**
 * @module ui-decorators/user-requests/UserRequestHandler
 * @summary Service-based base class for user request handlers.
 * @description No Angular or DOM imports — safe for pure-Node (backend) bundles.
 *
 * Handlers extend `Service`, receive a rendering-engine facade as a
 * `protected readonly` property and implement `handle`, either returning the
 * resolved value or throwing (a `CancelledError` when the user cancels
 * mid-request). Lookup and dispatch are static: `@userRequest(reference)`
 * records the class as metadata and `UserRequestHandler.getHandler(reference)`
 * / `UserRequestHandler.handle(request, renderingEngine)` resolve and run it,
 * so no process-wide registry instance is needed.
 */

import {
  Context,
  ContextFlags,
  ContextualArgs,
  ContextualizedArgs,
  FlagsOf,
  LoggerOf,
  MaybeContextualArg,
  MethodOrOperation,
  Service,
} from "@decaf-ts/core";
import { Constructor, Metadata } from "@decaf-ts/decoration";
import { InternalError } from "@decaf-ts/db-decorators";
import { Model } from "@decaf-ts/decorator-validation";
import { DecafComponent } from "../ui/DecafComponent";
import type { IDecafModal } from "../ui/interfaces/IDecafModal";
import { USER_REQUEST_KEY } from "./constants";
import { CancelledError } from "./errors";
import type {
  RenderingFacade,
  UserRequest,
  UserRequestHandlerMetadata,
} from "./types";

/**
 * @description Result of `UserRequestHandler.logCtx(...)`. Extends the
 * standard `{ log, ctx, ctxArgs }` surface with the exact `RenderingEngine`
 * methods a handler needs (`modal`/`toast`/`spinner`/`router`) wrapping the
 * rendering engine handed to the handler constructor. The keys mirror the
 * underlying engine methods without a `get` prefix, and no duplicated
 * `UserRequest*` rendering types are introduced.
 * @summary Contextual surface returned by `UserRequestHandler.logCtx(*, *, true)`.
 * @template C The decaf context the handler service runs under.
 * @template ARGS The contextual argument tuple passed to the call.
 */
export interface UserRequestLogContext<
  C extends Context<ContextFlags<any>> = Context<ContextFlags<any>>,
  ARGS extends any[] = any[],
> {
  log: LoggerOf<C>;
  ctx: C;
  ctxArgs: ContextualArgs<C, ARGS>;
  readonly modal: RenderingFacade["getModal"];
  readonly toast: RenderingFacade["getToast"];
  readonly spinner: RenderingFacade["getSpinner"];
  readonly router: RenderingFacade["router"];
}

/**
 * @description Abstract base class for user request handlers.
 *
 * Handler methods follow the core `Service` golden rules: `handle` (and the
 * lifecycle helpers `getInput`/`cancel`) accept rest contextual args
 * (`...args: ContextualArgs<C>`) and obtain their `{ log, ctx, ctxArgs }` via
 * `this.logCtx([request, ...args], this.handle, true)` — entry and resolution
 * via `log.info`, transitions via `log.verbose`, payload details via
 * `log.debug` and failures/cancellations via `log.error`. A `CancelledError`
 * is thrown when the user cancels mid-request. `handle` is the one async
 * method handlers override, returning the resolved value or throwing.
 * @summary Service-based base class implementing the user request lifecycle.
 * @template T The resolved payload type the handler returns.
 * @template C The decaf context the service runs under.
 */
export abstract class UserRequestHandler<
  T = unknown,
  C extends Context<ContextFlags<any>> = Context<ContextFlags<any>>,
> extends Service<C> {
  private currentModal?: IDecafModal;

  private cancelled = false;

  private submitted?: (value: T) => void;

  private dismissed?: (reason: unknown) => void;

  /**
   * @description Creates a handler bound to the given rendering-engine facade.
   * The facade is the only external dependency: no context/resolver
   * indirection.
   * @param {RenderingFacade} renderingEngine The rendering-engine surface the
   * handler drives (modal, toast, spinner and router).
   */
  protected constructor(protected readonly renderingEngine: RenderingFacade) {
    super();
  }

  /**
   * @description Resolves the handler class registered for the given request
   * reference via `Metadata`. Handlers are recorded by the `@userRequest`
   * decorator under `USER_REQUEST_KEY`.
   * @param {string} reference The request id/type the handler is registered
   * for.
   * @return {.Constructor<UserRequestHandler> | undefined}
   * The registered handler constructor, or `undefined` when unknown.
   */
  static getHandler(
    reference: string
  ): Constructor<UserRequestHandler> | undefined {
    return Metadata.get(
      USER_REQUEST_KEY as unknown as Constructor,
      reference
    ) as Constructor<UserRequestHandler> | undefined;
  }

  /**
   * @description Reads the `@userRequest` metadata recorded on a handler class
   * via `Metadata`.
   * @param {object} target The handler class to inspect.
   * @return {UserRequestHandlerMetadata | undefined} The recorded metadata
   * `{ reference }`, or `undefined` when the class is not decorated.
   */
  static getMetadata(target: object): UserRequestHandlerMetadata | undefined {
    return Metadata.get(target as Constructor, USER_REQUEST_KEY) as
      | UserRequestHandlerMetadata
      | undefined;
  }

  static async handle<T = unknown>(
    request: UserRequest<T>,
    renderingEngine: RenderingFacade
  ): Promise<T> {
    const id = request.type || request.id;
    const Handler = UserRequestHandler.getHandler(id);
    if (!Handler)
      throw new InternalError(`No user request handler registered for "${id}"`);
    const instance = new Handler(
      renderingEngine
    ) as unknown as UserRequestHandler<T>;
    const ctx = await instance.context("user-request", {});
    return instance.handle(request, ctx);
  }

  protected async getInput(
    request: UserRequest<T>,
    ...args: ContextualArgs<C>
  ): Promise<T> {
    const { log } = await this.logCtx([request, ...args], this.getInput, true);
    const component = { props: { request } } as Partial<DecafComponent<Model>>;
    log.info(
      `Requesting input for user request "${request.type || request.id}"`
    );
    const modal = await this.renderingEngine.getModal(component);
    this.currentModal = modal;
    if (this.cancelled) {
      this.currentModal = undefined;
      await modal.cancel();
      log.error(`User request "${request.type || request.id}" was cancelled`);
      throw new CancelledError(
        `User request "${request.type || request.id}" was cancelled`
      );
    }
    return this.awaitDismissal(request, modal);
  }


  private awaitDismissal(
    request: UserRequest<T>,
    modal: IDecafModal
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.submitted = resolve;
      this.dismissed = reject;
      const confirm = modal.confirm.bind(modal);
      const cancel = modal.cancel.bind(modal);
      modal.confirm = async (event?: any): Promise<void> => {
        try {
          await confirm(event);
          this.currentModal = undefined;
          const data = (event?.data ?? event) as T;
          resolve(data);
        } catch (error) {
          // A facade confirms with an error payload (e.g. a `ValidationError`
          // from an invalid form submission) by throwing it out of `confirm`;
          // reject the pending request with that decaf error instead of
          // leaving it hanging.
          this.currentModal = undefined;
          reject(error);
        }
      };
      modal.cancel = async (): Promise<void> => {
        await cancel();
        this.currentModal = undefined;
        reject(
          new CancelledError(
            `User request "${request.type || request.id}" was cancelled`
          )
        );
      };
    });
  }

  async cancel(...args: ContextualArgs<C> | []): Promise<void> {
    const { log } = await this.logCtx(args, this.cancel, true);
    log.info("Cancelling active user request");
    this.cancelled = true;
    const modal = this.currentModal;
    this.currentModal = undefined;
    if (this.dismissed) {
      log.verbose("Rejecting pending user request with CancelledError");
      this.dismissed(new CancelledError("User request was cancelled"));
      this.dismissed = undefined;
      this.submitted = undefined;
    }
    if (modal) {
      log.debug("Dismissing the active user request modal");
      await modal.cancel();
    }
    log.error("User request cancelled");
  }

  abstract handle(
    request: UserRequest<T>,
    ...args: ContextualArgs<C>
  ): Promise<T>;

  /**
   * @description Logging + rendering-engine methods for a call. Mirrors the
   * `Service` `logCtx` contract and exposes `modal`/`toast`/`spinner`/`router`
   * getters wrapping the rendering engine.
   * @param {MaybeContextualArg<C, ARGS>} args Contextual args (context at the
   * end, or pre-args plus context).
   * @param {METHOD} operation The operation the context is created for.
   * @param {boolean} allowCreate Whether a context is created when none is
   * provided.
   * @param {Partial<FlagsOf<CONTEXT>>} overrides Optional flag overrides.
   * @return {UserRequestLogContext<C, ARGS> | Promise<UserRequestLogContext<C, ARGS>>}
   * The contextual surface (or a promise of it when `allowCreate` is true).
   * @template C The decaf context the service runs under.
   * @template ARGS The contextual argument tuple passed to the call.
   * @template CONTEXT The context type to promote to when creating one.
   * @template METHOD The operation the context is created for.
   */
  protected override logCtx<
    ARGS extends any[] = any[],
    METHOD extends MethodOrOperation = MethodOrOperation,
  >(
    args: MaybeContextualArg<C, ARGS>,
    operation: METHOD
  ): UserRequestLogContext<C, ARGS>;
  protected override logCtx<
    CONTEXT extends Context<any> = C,
    ARGS extends any[] = any[],
    METHOD extends MethodOrOperation = MethodOrOperation,
  >(
    args: MaybeContextualArg<CONTEXT, ARGS>,
    operation: METHOD,
    allowCreate: false,
    overrides?: Partial<FlagsOf<CONTEXT>>
  ): UserRequestLogContext<C, ARGS>;
  protected override logCtx<
    CONTEXT extends Context<any> = C,
    ARGS extends any[] = any[],
    METHOD extends MethodOrOperation = MethodOrOperation,
  >(
    args: MaybeContextualArg<CONTEXT, ARGS>,
    operation: METHOD,
    allowCreate: true,
    overrides?: Partial<FlagsOf<CONTEXT>>
  ): Promise<UserRequestLogContext<C, ARGS>>;
  protected override logCtx<
    CONTEXT extends Context<any> = C,
    ARGS extends any[] = any[],
    METHOD extends MethodOrOperation = MethodOrOperation,
  >(
    args: MaybeContextualArg<CONTEXT, ARGS>,
    operation: METHOD,
    allowCreate: boolean = false,
    overrides?: Partial<FlagsOf<CONTEXT>>
  ): UserRequestLogContext<C, ARGS> | Promise<UserRequestLogContext<C, ARGS>> {
    const base = super.logCtx(
      args as any,
      operation as any,
      allowCreate as any,
      overrides as any
    ) as
      | ContextualizedArgs<C, ARGS, false>
      | Promise<ContextualizedArgs<C, ARGS, false>>;
    if (base instanceof Promise) {
      return (async (): Promise<UserRequestLogContext<C, ARGS>> =>
        this.wrapLogContext(await base))();
    }
    return this.wrapLogContext(base);
  }

  /**
   * @description Decorates the base contextual surface with the rendering
   * engine methods exposed as `modal`/`toast`/`spinner`/`router` bound getters.
   * @return {UserRequestLogContext<C, ARGS>} The decorated contextual surface.
   * @template C The decaf context the service runs under.
   * @template ARGS The contextual argument tuple passed to the call.
   */
  private wrapLogContext<ARGS extends any[] = any[]>(
    base: ContextualizedArgs<C, ARGS>
  ): UserRequestLogContext<C, ARGS> {
    const engine = this.renderingEngine;
    const result = {
      log: base.log,
      ctx: base.ctx,
      ctxArgs: base.ctxArgs,
    } as unknown as UserRequestLogContext<C, ARGS>;
    Object.defineProperties(result, {
      modal: {
        get: (): RenderingFacade["getModal"] => engine.getModal.bind(engine),
        enumerable: true,
        configurable: true,
      },
      toast: {
        get: (): RenderingFacade["getToast"] => engine.getToast.bind(engine),
        enumerable: true,
        configurable: true,
      },
      spinner: {
        get: (): RenderingFacade["getSpinner"] =>
          engine.getSpinner.bind(engine),
        enumerable: true,
        configurable: true,
      },
      router: {
        get: (): RenderingFacade["router"] => engine.router.bind(engine),
        enumerable: true,
        configurable: true,
      },
    });
    return result;
  }
}
