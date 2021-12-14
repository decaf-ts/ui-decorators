/**
 * Defines a class as a UI Model
 *
 * and add it the render method
 *
 * @decorator uimodel
 *
 * @category Decorators
 */
import {model} from "@tvenceslau/decorator-validation/lib";

export const uimodel = () => (original: Function) => {
    return model(undefined, instance => {

    })
}
