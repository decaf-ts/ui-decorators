/**
 * @module ui-decorators/dashboard/registry
 * @summary Dashboard-selectable component registry.
 * @description Module-level registry that tracks every `@dashcomponent`-
 * decorated constructor. The `@dashcomponent` decorator calls
 * {@link registerDashComponent} as a side-effect; consumers discover all
 * decorated classes via {@link dashComponents}.
 *
 * This follows the same pattern as the `graph` submodule's node registry and
 * the `InjectablesRegistry` in `injectable-decorators` — a private `Set`
 * rather than the `Metadata` internal helpers.
 */

import type { Constructor } from "@decaf-ts/decoration";

/**
 * Internal registry of all `@dashcomponent`-decorated constructors.
 */
const DASH_COMPONENT_REGISTRY = new Set<Constructor>();

/**
 * Appends a constructor to the dashboard component registry. Called by the
 * `@dashcomponent` decorator. Idempotent — re-decorating the same class does
 * not duplicate the entry.
 * @param ctor The `@dashcomponent`-decorated constructor.
 */
export function registerDashComponent(ctor: Constructor): void {
  DASH_COMPONENT_REGISTRY.add(ctor);
}

/**
 * Returns all `@dashcomponent`-decorated constructors.
 * @returns A fresh array of constructors (mutable; does not expose the internal set).
 */
export function dashComponents(): Constructor[] {
  return [...DASH_COMPONENT_REGISTRY];
}

/**
 * Clears the dashboard component registry. Intended for tests only.
 */
export function resetDashComponentRegistry(): void {
  DASH_COMPONENT_REGISTRY.clear();
}
