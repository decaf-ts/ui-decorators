/**
 * @module ui-decorators/dashboard/reader
 * @summary Metadata readers for `@dashcomponent()`-decorated classes.
 * @description Read-side helpers that resolve the palette metadata and the
 * normalized {@link DashComponentDefinition} attached by `@dashcomponent()`.
 * Accept either a constructor or an instance, and apply defaults so consumers
 * never resolve undefined footprint values.
 */

import { Constructor, Metadata } from "@decaf-ts/decoration";
import { DashKeys } from "./constants";
import type {
  DashComponentDefinition,
  DashComponentMetadata,
} from "./types";

/**
 * Normalizes a constructor-or-instance input to a constructor.
 * Falls back to the instance's own constructor and finally to the raw value
 * when {@link Metadata.constr} cannot resolve a usable constructor.
 * @param model The decorated class or an instance of it.
 */
function resolveModel<M>(model: Constructor<M> | M): Constructor<M> {
  const resolved = Metadata.constr(model as Constructor<M>);
  if (typeof resolved === "function") return resolved as Constructor<M>;
  const fallback = (model as { constructor?: Constructor<M> }).constructor;
  if (typeof fallback === "function") return fallback as Constructor<M>;
  return model as Constructor<M>;
}

/**
 * @description Returns the palette metadata attached by `@dashcomponent()`.
 * @summary Resolves the metadata object stored on the class, accepting either
 * the constructor or an instance.
 * @param {Constructor | object} model The decorated class or an instance of it.
 * @returns The palette metadata, or `undefined` when un-decorated.
 * @function dashComponentMetadataOf
 * @memberOf module:ui-decorators/dashboard/reader
 */
export function dashComponentMetadataOf<M>(
  model: Constructor<M> | M
): DashComponentMetadata | undefined {
  const resolved = resolveModel(model);
  return Metadata.get(resolved, DashKeys.COMPONENT) as
    | DashComponentMetadata
    | undefined;
}

/**
 * @description Resolves a normalized definition for a dashboard component.
 * @summary Applies defaults (tag from class name, size `{cols:1, rows:1}`)
 * so consumers never resolve undefined footprint values.
 * @param {Constructor | object} model The decorated class or an instance of it.
 * @returns A normalized {@link DashComponentDefinition}.
 * @function dashComponentDefinitionOf
 * @memberOf module:ui-decorators/dashboard/reader
 */
export function dashComponentDefinitionOf<M>(
  model: Constructor<M> | M
): DashComponentDefinition {
  const resolved = resolveModel(model);
  const meta = dashComponentMetadataOf(resolved) || {};
  const tag = meta.tag || resolved.name;
  return {
    name: resolved.name,
    tag,
    label: meta.label,
    defaultSize: meta.defaultSize ?? { cols: 1, rows: 1 },
    model: meta.model,
    props: meta.props,
    metadata: meta.metadata,
  };
}
