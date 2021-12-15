import Validatable from "@tvenceslau/decorator-validation/lib/validation/types";

/**
 * @interface UIModel
 * @extends Validatable
 */
export interface UIModel extends Validatable {
    /**
     * Render Method. Will be added to the object after if it has a @uimodel decorator
     *
     * Child classes should not implement this. The implementation comes from the 'uimodel' decorator
     *
     * @param args
     */
    render?(...args: any[]): any;
}