/**
 * @module ui-decorators/user-requests/errors
 * @summary Decaf error hierarchy for the User Request Resolution Engine.
 */

import { InternalError } from "@decaf-ts/db-decorators";

/**
 * @description Error thrown when the user cancels a user request mid-resolution.
 * Follows the decaf error hierarchy: never a raw `Error`. Compatible with the
 * validation error signaling used by `@devcerts/decaf` UI facades.
 * @summary Error thrown when a user request is cancelled.
 */
export class CancelledError extends InternalError {
  /**
   * @param {string | Error | unknown} msg The cancellation message.
   * @return {CancelledError} A new `CancelledError`.
   */
  constructor(msg: string | Error | unknown = "User request cancelled") {
    super(msg, CancelledError.name, 400);
  }
}
