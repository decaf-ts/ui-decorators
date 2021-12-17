import {construct, Model, model} from "@tvenceslau/decorator-validation/lib";
import {getRenderStrategy} from "../ui";
import {UIKeys} from "../ui/constants";

export const getUIModelKey = (key: string) => UIKeys.REFLECT + key;

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
export const uimodel = (tag?: string, props?: {[indexer: string]: string}, instanceCallback?: (instance: any) => void) => (original: Function) => {

    // the new constructor behaviour
    const newConstructor : any = function (...args: any[]) {
        const instance = construct(original, ...args);

        const metadata = Object.assign({}, {
            class: original.name
        });

        Reflect.defineMetadata(
            getUIModelKey(UIKeys.UIMODEL),
            Object.assign(metadata, props || {}),
            instance.constructor
        );

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

        return instance;
    }

    // copy prototype so instanceof operator still works
    newConstructor.prototype = original.prototype;
    // Sets the proper constructor name for type verification
    Object.defineProperty(newConstructor, "name", {
        writable: false,
        enumerable: true,
        configurable: false,
        value: original.prototype.constructor.name
    });
    // return new constructor (will override original)
    return newConstructor;
    //
    // return model(undefined, instance => {
    //     function render(this: Model, ...args: any){
    //         getRenderStrategy()(this, ...args);
    //     }
    //
    //     Object.defineProperty(instance, render.name, {
    //         enumerable: false,
    //         writable: false,
    //         value: render.bind(instance)
    //     });
    //
    //     if (instanceCallback)
    //         instanceCallback(instance);
    // })(original)
}
