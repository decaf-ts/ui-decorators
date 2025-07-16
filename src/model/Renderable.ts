/**
 * @description Interface for objects that can be rendered
 * @summary Defines the contract for objects that can be rendered to a specific output format
 * This interface provides a generic render method that can transform the implementing object
 * into any desired output format.
 * @interface Renderable
 * @memberOf module:ui-decorators/model
 */
export interface Renderable {
  /**
   * @description Renders the object to a specific output format
   * @summary Transforms the object into the desired output representation
   * @template R The return type of the render operation
   * @param {any[]} args Additional arguments needed for rendering
   * @return {R} The rendered output in the specified format
   */
  render<R>(...args: any[]): R;
}
