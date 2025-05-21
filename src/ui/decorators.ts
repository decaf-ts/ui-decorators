import "reflect-metadata";
import { UIKeys } from "./constants";
import { propMetadata } from "@decaf-ts/decorator-validation";
import { CrudOperationKeys, UIElementMetadata, UIListPropMetadata, UIPropMetadata } from "./types";
import { RenderingEngine } from "./Rendering";
import { OperationKeys } from "@decaf-ts/db-decorators";

/**
 * @namespace ui-decorators.ui.decorators
 * @memberOf ui-decorators.ui
 */

export function hideOn(...operations: CrudOperationKeys[]) {
  return propMetadata<CrudOperationKeys[]>(
    RenderingEngine.key(UIKeys.HIDDEN),
    operations
  );
}

export function hidden() {
  return hideOn(
    OperationKeys.CREATE,
    OperationKeys.READ,
    OperationKeys.UPDATE,
    OperationKeys.DELETE
  );
}

/**
 * Adds the UIElement definition as metadata to the property, allowing it to be read by any {@link RenderStrategy}
 *
 * @param {string} tag The component/HTML element tag name
 * @param {{}} [props] The properties to pass to that component/HTML Element
 * @param serialize
 *
 * @decorator uielement
 *
 * @category Decorators
 * @subcategory ui-decorators
 */
export function uielement(
  tag: string,
  props?: Record<string, any>,
  serialize: boolean = false
) {
  return (original: any, propertyKey?: any) => {
    const metadata: UIElementMetadata = {
      tag: tag,
      serialize: serialize,
      props: Object.assign(
        {
          name: propertyKey,
        },
        props || {}
      ),
    };

    return propMetadata(RenderingEngine.key(UIKeys.ELEMENT), metadata)(
      original,
      propertyKey
    );
  };
}

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


/**
 * Decorates a property to define a list property for UI mapping.
 * This decorator requires a '@uilistitem' with a defined tag.
 *
 * @param {string | undefined} [propName] - The property name that will be passed to the component.
 * Defaults to the PropertyKey.
 * @param {Record<string, any>} [props] - Additional properties to pass to the component.
 *
 * @returns {(target: any, propertyKey: string) => void} - A decorator function.
 *
 * @decorator uilistprop
 *
 * @category Decorators
 * @subcategory ui-decorators
 */
export function uilistprop(
  propName: string | undefined = undefined,
  props?: Record<string, any>,
) {
  return (target: any, propertyKey: string) => {
      const metadata: Partial<UIListPropMetadata> = {
      name: propName || propertyKey,
      props: props || {}
    };
    propMetadata(RenderingEngine.key(UIKeys.UILISTPROP), metadata)(
      target,
      propertyKey
    );
  };
}
