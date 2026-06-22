import { DecafToastOptions, DecafToastRole } from "../types";

/**
 * @description Contract for toast notification management in Decaf applications.
 * @summary Defines the public API for displaying toast messages with semantic types
 * (error, success, warning, info), custom options, and dismissal role tracking.
 *
 * @interface IDecafToast
 * @since 2026-06-19
 * @memberOf module:ui-decorators/ui/interfaces
 */
export interface IDecafToast {
  options: DecafToastOptions;

  /**
   * @description Displays an error toast with danger styling.
   * @summary Presents a toast with the danger color and waits for dismissal,
   * returning the role that caused it.
   *
   * @param {string} message - The error message to display
   * @returns {Promise<DecafToastRole>} Resolves with the dismissal role
   * @memberOf module:ui-decorators/ui/interfaces
   */
  error(message: string): Promise<DecafToastRole>;

  /**
   * @description Creates and presents a toast from a full options object.
   * @summary Convenience wrapper around {@link show} for callers that already
   * have a complete {@link DecafToastOptions} object.
   *
   * @param {DecafToastOptions} options - Full toast configuration options
   * @returns {Promise<object>} Resolves with the created toast element
   * @memberOf module:ui-decorators/ui/interfaces
   */
  create(options: DecafToastOptions): Promise<object>;

  /**
   * @description Displays an informational toast with default styling.
   * @summary Presents a toast without a semantic color, suitable for neutral messages.
   * Additional options can override the defaults.
   *
   * @param {string} message - The informational message to display
   * @param {DecafToastOptions} [options={}] - Optional overrides for toast configuration
   * @returns {Promise<void>} Resolves when the toast is presented
   * @memberOf module:ui-decorators/ui/interfaces
   */
  show(message: string, options?: DecafToastOptions): Promise<void>;

  /**
   * @description Displays a success toast with success styling.
   * @summary Presents a toast with the success color for positive feedback messages.
   *
   * @param {string} message - The success message to display
   * @returns {Promise<void>} Resolves when the toast is presented
   * @memberOf module:ui-decorators/ui/interfaces
   */
  success(message: string): Promise<void>;

  /**
   * @description Displays a warning toast with warning styling.
   * @summary Presents a toast with the warning color and waits for dismissal,
   * returning the role that caused it.
   *
   * @param {string} message - The warning message to display
   * @returns {Promise<DecafToastRole>} Resolves with the dismissal role
   * @memberOf module:ui-decorators/ui/interfaces
   */
  warn(message: string): Promise<DecafToastRole>;
}
