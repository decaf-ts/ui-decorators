import "reflect-metadata";
import {UIKeys, RenderModes} from "./constants";

const getUIKey = (key: string) => UIKeys.REFLECT + key;

/**
 *
 * @param {string} tag The component/HTML element tag name
 * @param {{[indexer]: string}} [props] The properties to pass to that component/HTML Element
 * @param {string} [valueAttribute] The property name that holds the input value. defaults to 'value'
 * @param {string[] | string} [renderModes] When an array of {@link RenderModes}, the render modes on with the UI element is applied {@link RenderModes}, When a string, the property the 'isEdit' boolean will be injected in the component.
 *
 * @decorator uielement
 *
 * @category Decorators
 */
export const uielement = (tag: string, props?: {}, valueAttribute: string = 'value', renderModes: string[] = [RenderModes.VIEW, RenderModes.CREATE]) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getUIKey(UIKeys.ELEMENT),
        {
            tag: tag,
            renderModes: renderModes,
            valueAttribute: valueAttribute,
            props: props
        },
        target,
        propertyKey
    );
}
