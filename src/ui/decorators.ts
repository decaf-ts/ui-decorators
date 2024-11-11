import "reflect-metadata";
import { UIKeys } from "./constants";
import { propMetadata } from "@decaf-ts/decorator-validation";

/**
 * @namespace ui-decorators.ui.decorators
 * @memberOf ui-decorators.ui
 */

/**
 *
 * @param {string} key
 *
 * @function getUIKey
 *
 * @memberOf ui-decorators.ui.decorators
 */
const getUIKey = (key: string) => UIKeys.REFLECT + key;

/**
 * @typedef UIElementMetadata
 * @memberOf ui-decorators.ui.decorators
 */
export type UIElementMetadata = {
  tag: string;
  args?: any[];
  props?: Record<string, any>;
  serialize?: boolean;
};

/**
 * Adds the UIElement definition as metadata to the property, allowing it to be read by any {@link RenderStrategy}
 *
 * @param {string} tag The component/HTML element tag name
 * @param {{}} [props] The properties to pass to that component/HTML Element
 * @param {any[]} [args] optional arguments that will be passed to the rendering strategy.
 *
 * @decorator uielement
 *
 * @category Decorators
 * @subcategory ui-decorators
 */
export function uielement(
  tag: string,
  props?: { [indexer: string]: any },
  serialize: boolean = false,
  ...args: any[]
) {
  const metadata: UIElementMetadata = {
    tag: tag,
    serialize: serialize,
    props: props,
    args: args,
  };
  return propMetadata(getUIKey(UIKeys.ELEMENT), metadata);
}
/**
 * @typedef UIPropMetadata
 * @memberOf ui-decorators.ui.decorators
 */
export type UIPropMetadata = {
  name: string;
  stringify: boolean;
};

/**
 * Adds the UIProp definition as metadata to the property, allowing it to be read by any {@link RenderStrategy}
 *
 * this requires a '@uimodel' with a defined tag
 *
 * @param {string} [propName] the property name that will be passed to the component. defaults to the PropertyKey
 *
 * @decorator uiprop
 *
 * @category Decorators
 * @subcategory ui-decorators
 */
export const uiprop =
  (propName: string | undefined = undefined, stringify: boolean = false) =>
  (target: any, propertyKey: string) => {
    const metadata: UIPropMetadata = {
      name: propName || propertyKey,
      stringify: stringify,
    };

    Reflect.defineMetadata(
      getUIKey(UIKeys.PROP),
      metadata,
      target,
      propertyKey
    );
  };
