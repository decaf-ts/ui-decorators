/**
 * @module ui-decorators/user-requests/constants
 * @summary Metadata keys for the User Request Resolution Engine.
 */

/**
 * @description Metadata key under which user request handlers are registered
 * and resolved.
 * @summary The `@userRequest(reference)` decorator stores both the handler
 * reference and the decorating metadata under this key, and
 * `UserRequestHandler.getHandler` / `UserRequestHandler.getMetadata` read it
 * back. The key is scoped to the User Request Resolution Engine to avoid
 * colliding with other reflection metadata.
 * @const USER_REQUEST_KEY
 * @type {string}
 * @readonly
 */
export const USER_REQUEST_KEY = "user-requests.handler";
