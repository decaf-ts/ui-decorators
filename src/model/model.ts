import { Renderable } from "./Renderable";

declare module "@decaf-ts/decorator-validation" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  declare interface Model extends Renderable {
    /**
     * @description Checks if a property of a model is itself a model or has a model type
     * @summary Determines whether a specific property of a model instance is either a model instance
     * or has a type that is registered as a model. This function is used for model serialization
     * and deserialization to properly handle nested models.
     * @template R the expected UI code according to each rendering engine
     * @param {any[]} args - optional engine specific args
     */
    render<R>(...args: any[]): R;
  }
}
