import Validatable from "@tvenceslau/decorator-validation/lib/validation/types";

/**
 * @interface UIModel
 * @memberOf model
 */
export interface UIModel extends Validatable {
    render(...args: any[]): any;
}