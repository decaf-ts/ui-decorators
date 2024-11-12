import { UIKeys } from "../ui/constants";
import { Model } from "@decaf-ts/decorator-validation";
import { apply, metadata } from "@decaf-ts/reflection";
import { UIModelMetadata } from "../types";

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
    return metadata(Model.uiKey(UIKeys.UIMODEL), meta)(original);
  };
}

export function renderedBy(engine: string) {
  return apply(metadata(Model.uiKey(UIKeys.RENDERED_BY), engine));
}
