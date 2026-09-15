/**
 * @module ui-decorators/dashboard/constants
 * @summary Metadata keys for the dashboard-selectable-component decorator.
 * @description Namespaced keys used to store palette metadata on a
 * `@dashcomponent`-decorated class. Mirrors the `graph` submodule's
 * `GraphKeys` convention so the dashboard metadata family is isolated from
 * the UI model metadata keys.
 */

/**
 * @description Metadata key constants for dashboard components.
 * @summary Collection of string keys used as metadata namespaces for
 * dashboard-selectable components. The `COMPONENT` key carries the palette
 * metadata object attached by `@dashcomponent()`.
 * @enum DashKeys
 * @memberOf module:ui-decorators/dashboard/constants
 */
export enum DashKeys {
  /** Namespace root for all dashboard metadata. */
  ROOT = "dashboard",
  /** Key under which `@dashcomponent()` palette metadata is stored. */
  COMPONENT = `${DashKeys.ROOT}.component`,
}
