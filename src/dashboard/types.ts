/**
 * @module ui-decorators/dashboard/types
 * @summary Type definitions for dashboard-selectable components.
 * @description Flavor-neutral types describing the palette metadata attached
 * by `@dashcomponent()` and the resolved definition consumed by a palette
 * service. No Angular or framework imports.
 */

import type { Constructor } from "@decaf-ts/decoration";

/**
 * @description Grid footprint of a dashboard component.
 * @summary A component's default footprint on the dashboard grid, expressed
 * in grid units (columns and rows).
 * @typedef DashComponentSize
 * @memberOf module:ui-decorators/dashboard/types
 * @property {number} cols - Number of grid columns occupied.
 * @property {number} rows - Number of grid rows occupied.
 */
export type DashComponentSize = {
  cols: number;
  rows: number;
};

/**
 * @description Palette metadata attached to a dashboard-selectable component.
 * @summary The metadata object stored on a `@dashcomponent`-decorated class.
 * Carries the translation label key, the default grid size, and an optional
 * reference to the configuration model used by the component's own CRUD flow.
 * @typedef DashComponentMetadata
 * @memberOf module:ui-decorators/dashboard/types
 * @property {string} [tag] - Component tag resolved for rendering.
 * @property {string} [label] - Translation label key for the palette.
 * @property {DashComponentSize} [defaultSize] - Default grid footprint.
 * @property {Constructor} [model] - Configuration model constructor reference.
 * @property {Record<string, any>} [props] - Ad-hoc props for the component.
 * @property {Record<string, unknown>} [metadata] - Free-form extension points.
 */
export type DashComponentMetadata = {
  tag?: string;
  label?: string;
  defaultSize?: DashComponentSize;
  model?: Constructor;
  props?: Record<string, any>;
  metadata?: Record<string, unknown>;
};

/**
 * @description Resolved definition of a dashboard-selectable component.
 * @summary The normalized shape a palette or rendering service consumes from
 * the registry. Defaults are applied so consumers never resolve undefined
 * footprint values.
 * @typedef DashComponentDefinition
 * @memberOf module:ui-decorators/dashboard/types
 * @property {string} name - Class name of the decorated component.
 * @property {string} tag - Component tag resolved for rendering.
 * @property {string} [label] - Translation label key for the palette.
 * @property {DashComponentSize} defaultSize - Default grid footprint.
 * @property {Constructor} [model] - Configuration model constructor reference.
 * @property {Record<string, any>} [props] - Ad-hoc props for the component.
 * @property {Record<string, unknown>} [metadata] - Free-form extension points.
 */
export type DashComponentDefinition = {
  name: string;
  tag: string;
  label?: string;
  defaultSize: DashComponentSize;
  model?: Constructor;
  props?: Record<string, any>;
  metadata?: Record<string, unknown>;
};
