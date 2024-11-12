import "reflect-metadata";
import { UIKeys } from "./constants";
import { propMetadata } from "@decaf-ts/decorator-validation";
import { RenderingEngine } from "./Rendering";

/**
 * @typedef UIElementMetadata
 * @memberOf ui-decorators.ui.decorators
 */
export type UIElementMetadata = {
  tag: string;
  props?: Record<string, unknown>;
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
  props?: Record<string, unknown>,
  serialize: boolean = false
) {
  const metadata: UIElementMetadata = {
    tag: tag,
    serialize: serialize,
    props: props,
  };
  return propMetadata(RenderingEngine.key(UIKeys.ELEMENT), metadata);
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
export function uiprop(
  propName: string | undefined = undefined,
  stringify: boolean = false
) {
  return (target: any, propertyKey: string) => {
    const metadata: UIPropMetadata = {
      name: propName || propertyKey,
      stringify: stringify,
    };
    propMetadata(RenderingEngine.key(UIKeys.PROP), metadata)(
      target,
      propertyKey
    );
  };
}
