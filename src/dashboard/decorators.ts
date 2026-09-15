/**
 * @module ui-decorators/dashboard/decorators
 * @summary The `@dashcomponent()` class decorator.
 * @description Decorator module that marks decaf model classes as
 * dashboard-selectable palette entries. Attaches the {@link DashComponentMetadata}
 * payload under {@link DashKeys.COMPONENT} and registers the class in the
 * dashboard registry as a side-effect.
 */

import {
  apply,
  Decoration,
  metadata,
} from "@decaf-ts/decoration";
import type { Constructor } from "@decaf-ts/decoration";
import { uimodel } from "../model/decorators";
import { DashKeys } from "./constants";
import type { DashComponentMetadata } from "./types";
import { registerDashComponent } from "./registry";

/**
 * @description Class decorator that marks a class as dashboard-selectable.
 * @summary Attaches palette metadata (translation label key, default grid
 * size, configuration model reference) and registers the constructor in the
 * dashboard component registry, mirroring the graph `@node()` decorator.
 *
 * Usage:
 * ```ts
 * @dashcomponent("my.widget", {
 *   label: "my.widget.label",
 *   defaultSize: { cols: 2, rows: 1 },
 *   model: MyWidgetConfigModel,
 * })
 * @model()
 * export class MyWidget extends Model { ... }
 * ```
 *
 * @param {string} [tag] The component tag (defaults to the class name).
 * @param {DashComponentMetadata} [dash] Palette metadata.
 * @param {Record<string, any>} [props] Ad-hoc props for the component.
 * @return {Function} A class decorator function.
 * @function dashcomponent
 * @category Class Decorators
 */
export function dashcomponent(
  tag?: string,
  dash?: DashComponentMetadata,
  props?: Record<string, any>
) {
  function dashcomponent(
    tag?: string,
    dash?: DashComponentMetadata,
    props?: Record<string, any>
  ) {
    const meta: DashComponentMetadata = {
      tag: dash?.tag || tag,
      ...dash,
      defaultSize: dash?.defaultSize ?? { cols: 1, rows: 1 },
    };
    return function innerDashComponent(target: object) {
      const result = apply(
        uimodel(tag, props),
        metadata(DashKeys.COMPONENT, meta)
      )(target);
      registerDashComponent(target as Constructor);
      return result;
    };
  }

  return Decoration.for(DashKeys.COMPONENT)
    .define({
      decorator: dashcomponent,
      args: [tag, dash, props],
    })
    .apply();
}
