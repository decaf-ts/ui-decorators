import { UIKeys } from "../ui/constants";
import { apply, metadata } from "@decaf-ts/reflection";
import { RenderingEngine } from "../ui/Rendering";
import { UIListItemModelMetadata, UIModelMetadata } from "../ui/types";

/**
 * Tags the model as a uimodel, giving it the 'render' method
 *
 * @param {string} [tag] optional param. will render the provided elment wrapping the attribute uielements
 * @param {{}} [props] optional param. Attributes to be passed to the tag element
 * @param {function(any): void} [instanceCallback] optional callback returning the instance after creation for additional logic
 *
 * @decorator uimodel
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uimodel
 *   participant constructor
 *   participant instance
 *   System->>uimodel:do(constructor)
 *   uimodel->>constructor: Executes the constructor
 *   constructor->>uimodel: returns instance
 *   uimodel->>instance: adds the render method
 *   uimodel->>System: returns UIModel instance
 *
 * @category Decorators
 */
export function uimodel(tag?: string, props?: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (original: any, propertyKey?: any) => {
    const meta: UIModelMetadata = {
      tag: tag || original.name,
      props: props,
    };
    return metadata(RenderingEngine.key(UIKeys.UIMODEL), meta)(original);
  };
}

export function renderedBy(engine: string) {
  return apply(metadata(RenderingEngine.key(UIKeys.RENDERED_BY), engine));
}

/**
 * Tags the model as a list item for UI rendering, specifying how it should be rendered in list contexts
 *
 * @param {string} [tag] optional param. will render the provided element as the list item container
 * @param {{}} [props] optional param. Attributes to be passed to the tag element
 *
 * @decorator uilistitem
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uilistitem
 *   participant Model
 *   System->>uilistitem: apply to Model
 *   uilistitem->>Model: adds list item metadata
 *   Model->>System: returns Model with list item rendering capabilities
 *
 * @category Decorators
 */
export function uilistitem(tag?: string,  props?: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (original: any, propertyKey?: any) => {
    const meta: UIListItemModelMetadata = { 
      item: {
        tag: tag || original.name,
        props: props,
      } 
      
    };
    return metadata(RenderingEngine.key(UIKeys.UILISTITEM), meta)(original);
  };
}