import { InternalError } from "@decaf-ts/db-decorators";

/**
 * @description Error thrown when a rendering operation fails
 * @summary Specialized error for rendering failures in UI components
 * This error is thrown when the rendering engine encounters an error while
 * attempting to render a UI component or model.
 *
 * @param {string|Error} msg The error message or original error
 *
 * @class RenderingError
 * @extends BaseError
 * @category Errors
 *
 * @example
 * // Throwing a rendering error
 * try {
 *   // Rendering code that might fail
 *   if (!component.canRender()) {
 *     throw new RenderingError('Component cannot be rendered');
 *   }
 * } catch (error) {
 *   console.error('Rendering failed:', error.message);
 * }
 */
export class RenderingError extends InternalError {
  /**
   * @description Creates a new RenderingError instance
   * @summary Initializes the error with a message or original error
   * @param {string|Error} msg The error message or original error
   */
  constructor(msg: string | Error) {
    super(msg, RenderingError.name);
  }
}
