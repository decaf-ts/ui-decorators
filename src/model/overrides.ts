/**
 * @description Module that extends the Model prototype with rendering capabilities
 * @summary Adds the render method to all Model instances from decorator-validation
 * This module implements the Renderable interface for the Model class by adding a render method
 * to its prototype. This allows any Model instance to be rendered using the RenderingEngine.
 * @module model/overrides
 * @memberOf module:ui-decorators/model
 */

import { Model } from "@decaf-ts/decorator-validation";
import { RenderingEngine } from "../ui/Rendering";

/**
 * @description Renders the model using the appropriate rendering engine
 * @summary Delegates rendering to the RenderingEngine based on model metadata
 * This method implements the render method from the Renderable interface for all Model instances.
 * It uses the RenderingEngine to determine how to render the model based on its metadata.
 *
 * @template M Type of the model being rendered
 * @param {any[]} args Additional arguments to pass to the rendering engine
 * @return {any} The rendered output in the format determined by the rendering engine
 */
Model.prototype.render = function <M extends Model>(this: M, ...args: any[]) {
  return RenderingEngine.render(this, ...args);
};
