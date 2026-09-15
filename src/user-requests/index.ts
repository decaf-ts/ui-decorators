/**
 * @module ui-decorators/user-requests
 * @summary Backend binding surface for the User Request Resolution Engine.
 * @description Framework-agnostic core of the engine: no Angular or DOM
 * imports, safe for pure-Node (backend) bundles. Handlers are registered via
 * `@userRequest(reference)` (metadata) and resolved/dispatched through the
 * static `UserRequestHandler` methods; example handlers and rendering-engine
 * mocks live only in the test tree, never under `src`. Frontend bindings live
 * in `for-angular`.
 */

export * from "./constants";
export * from "./errors";
export * from "./types";
export * from "./UserRequestHandler";
export * from "./decorators";
