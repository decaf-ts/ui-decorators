import {Model, model} from "@tvenceslau/decorator-validation/lib";
import {getRenderStrategy} from "../ui";
/**
 * Tags the model as a uimodel, giving it the 'render' method
 *
 * @prop {function(any): void} [instanceCallback] optioncal callback returning the instance after creation for additional logic
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
 * @subcategory ui-decorators
 */

export const uimodel = (instanceCallback?: (instance: any) => void) => (original: Function) => {
    return model(undefined, instance => {
        function render(this: Model, ...args: any){
            getRenderStrategy()(this, ...args);
        }

        Object.defineProperty(instance, render.name, {
            enumerable: false,
            writable: false,
            value: render.bind(instance)
        });

        if (instanceCallback)
            instanceCallback(instance);
    })(original)
}
