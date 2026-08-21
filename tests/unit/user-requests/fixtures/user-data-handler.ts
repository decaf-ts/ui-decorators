/**
 * @module ui-decorators/tests/unit/user-requests/fixtures/user-data-handler
 * @summary Test fixture `user-data` handler for the User Request Resolution Engine.
 * @description The FR-5 symmetry fixture: a real `@userRequest("user-data")`
 * handler exercising the golden `Service` rules. Lives under the test tree
 * only — never exported from `src`. Backend tests drive it through the mock
 * rendering-engine facade (`UserRequestHandler.handle(request, facade)`), and
 * `for-angular` UI tests drive the same class through the real facade. No
 * Angular or DOM imports.
 */

import {
  Context,
  ContextFlags,
  ContextualArgs,
} from "@decaf-ts/core";
import { userRequest } from "../../../../src/user-requests";
import { UserRequestHandler } from "../../../../src/user-requests";
import type { UserRequest } from "../../../../src/user-requests";

/**
 * @description Payload/result shape resolved by the `user-data` fixture
 * handler.
 * @summary Input shape resolved by the `user-data` fixture handler.
 */
export interface UserData {
  name: string;
  email: string;
}

/**
 * @description Shared `user-data` request handler. Obtains the user's input
 * through the rendering-engine facade and normalizes it (trims name,
 * lowercases email). Follows the core `Service` golden rules: accepts rest
 * contextual args, obtains `{ log, ctxArgs }` via
 * `this.logCtx([request, ...args], this.handle, true)`, logs the entry and
 * resolution at `info`, payload details at `debug` and failures at `error`.
 * @summary `user-data` fixture handler normalizing mocked user input.
 */
@userRequest("user-data")
export class UserDataUserRequestHandler extends UserRequestHandler<UserData> {
  async handle(
    request: UserRequest<UserData>,
    ...args: ContextualArgs<Context<ContextFlags<any>>>
  ): Promise<UserData> {
    const { log, ctxArgs } = await this.logCtx(
      [request, ...args],
      this.handle,
      true
    );
    log.info(`Resolving user-data request ${request.id}`);
    try {
      const submitted = await this.getInput(request, ...ctxArgs);
      const result = {
        name: submitted.name.trim(),
        email: submitted.email.toLowerCase(),
      };
      log.debug(
        `Normalized user-data request ${request.id} payload: ${JSON.stringify(
          submitted
        )}`
      );
      log.info(`User-data request ${request.id} resolved`);
      return result;
    } catch (error) {
      log.error(
        `User-data request ${request.id} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}
