/**
 * @module ui-decorators/user-requests/decorators
 * @summary `@userRequest(reference)` class decorator.
 * @description No Angular or DOM imports — safe for pure-Node (backend)
 * bundles. Registration is metadata-based: the decorator records the handler
 * class under `USER_REQUEST_KEY` and the static `UserRequestHandler` methods
 * resolve and dispatch it, so no process-wide registry is involved.
 */

import {
  Constructor,
  Decoration,
  metadata,
  Metadata,
} from "@decaf-ts/decoration";
import { USER_REQUEST_KEY } from "./constants";
import type { UserRequestHandlerMetadata } from "./types";

/**
 * @description Registers a handler class for the given request id/type.
 *
 * Mirrors `core/src/migrations/decorators.ts`:
 * `Decoration.for(KEY).define({ decorator, args }).apply()` plus
 * `Metadata.set(USER_REQUEST_KEY, reference, original)` so the class is
 * retrievable by id via metadata — `UserRequestHandler.getHandler(reference)`
 * reads it back and `UserRequestHandler.handle(request, renderingEngine)`
 * dispatches it — and a class-level `metadata(...)` payload for
 * introspection (`UserRequestHandler.getMetadata(target)`).
 * @param {string} reference The request id/type the handler is registered for.
 * @return {ClassDecorator} The class decorator to apply.
 */
export function userRequest(reference: string): ClassDecorator {
  function innerUserRequest(ref: string) {
    return function userRequestDecorator(target: object) {
      const constructor = target as Constructor;
      const meta: UserRequestHandlerMetadata = { reference: ref };
      Metadata.set(USER_REQUEST_KEY, ref, constructor);
      return metadata(USER_REQUEST_KEY, meta)(constructor);
    };
  }

  return Decoration.for(USER_REQUEST_KEY)
    .define({ decorator: innerUserRequest, args: [reference] })
    .apply() as ClassDecorator;
}
