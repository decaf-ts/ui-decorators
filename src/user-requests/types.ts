/**
 * @module ui-decorators/user-requests/types
 * @summary Framework-agnostic contracts for the User Request Resolution Engine.
 * @description No Angular or DOM imports are allowed here so the `user-requests`
 * entry point stays consumable from pure-Node (backend) bundles.
 */

import type { RenderingEngine } from "../ui/Rendering";

/**
 * @description A user request payload. `id` identifies the request instance,
 * `type` is the keyed handler reference used for resolution — handlers are
 * dispatched via `UserRequestHandler.handle(request, renderingEngine)`, which
 * resolves the registered handler class by `request.type || request.id` — and
 * `payload` carries optional request data.
 * @template T The shape of the optional request data.
 */
export interface UserRequest<T = unknown> {
  id: string;
  type: string;
  payload?: T;
}

/**
 * @description The rendering-engine surface a user request handler needs.
 * Exposes exactly the four real `RenderingEngine` methods a handler drives
 * (modal, toast, spinner and router); no duplicated rendering types.
 * @summary The four real `RenderingEngine` methods handed to handlers.
 */
export type RenderingFacade = Pick<
  RenderingEngine,
  "getModal" | "getToast" | "getSpinner" | "router"
>;

/**
 * @description Metadata recorded by `@userRequest(reference)` on a handler
 * class and read back via `UserRequestHandler.getMetadata(target)`. `reference`
 * is the request id/type the handler is registered for.
 * @summary Metadata recorded on a `@userRequest`-decorated handler class.
 */
export interface UserRequestHandlerMetadata {
  reference: string;
}
