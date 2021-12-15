import "reflect-metadata";
import {UIKeys} from "../../lib";

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
    tag: string,
    args?: any[],
    props?: {[indexer: string]: any}
}

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
export const uielement = (tag: string, props?: {[indexer: string]: any}, ...args: any[]) => (target: any, propertyKey: string) => {
    const metadata: UIElementMetadata = {
        tag: tag,
        props: props,
        args: args
    };

    Reflect.defineMetadata(
        getUIKey(UIKeys.ELEMENT),
        metadata,
        target,
        propertyKey
    );
}
