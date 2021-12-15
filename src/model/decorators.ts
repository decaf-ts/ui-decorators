/**
 * Defines a class as a UI Model
 *
 * and add it the render method
 *
 * @decorator uimodel
 *
 * @category Decorators
 */
import {Model, model} from "@tvenceslau/decorator-validation/lib";
import {getRenderStrategy} from "../ui/render";

export const uimodel = () => (original: Function) => {
    return model(undefined, instance => {
        function render(this: Model, ...args: any){
            getRenderStrategy()(this, ...args);
        }

        Object.defineProperty(instance, render.name, {
            enumerable: false,
            writable: false,
            value: render.bind(instance)
        });
    })(original)
}
