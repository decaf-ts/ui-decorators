import "reflect-metadata";
import {UIKeys} from "./constants";

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
 * @typedef UIPropertyDecoratorDefinition
 * @memberOf ui-decorators.ui.decorators
 */
export type UIPropertyDecoratorDefinition = {
    /**
     *
     */
    prop: string | symbol,
    /**
     *
     */
    decorators: UIDecoratorDefinition[]
}
/**
 * @typedef UIDecoratorDefinition
 * @memberOf ui-decorators.ui.decorators
 */
export type UIDecoratorDefinition = {
    /**
     *
     */
    key: string,
    /**
     *
     */
    props: UIElementDefinition
}
/**
 * @typedef UIElementDefinition
 * @memberOf ui-decorators.ui.decorators
 */
export type UIElementDefinition = {
    /**
     *
     */
    tag: string,
    /**
     *
     */
    props: {[indexer: string]: string},
    /**
     *
     */
    valueAttribute?: string
    ,
}

export type UIElementMetadata = {
    tag: string,
    args?: any[],
    props?: {[indexer: string]: any}
}

/**
 *
 * @param {string} tag The component/HTML element tag name
 * @param {{[indexer]: string}} [props] The properties to pass to that component/HTML Element
 * @param {any[]} [args] optional arguments that will be passed to the rendering strategy.
 *
 * @decorator uielement
 *
 * @category Decorators
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
