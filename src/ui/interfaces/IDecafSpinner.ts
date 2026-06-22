/**
 * @description Contract for loading overlay management in Decaf applications.
 * @summary Defines the public API for displaying, updating, and dismissing loading overlays
 * with optional progress tracking and message updates.
 *
 * @interface IDecafSpinner
 * @since 2026-06-19
 * @memberOf module:ui-decorators/ui/interfaces
 */
export interface IDecafSpinner {
  /**
   * @description Checks if a loading overlay is currently visible.
   * @summary Returns true when a loading overlay is active and displayed to the user.
   *
   * @returns {boolean} True if a loading overlay is visible, false otherwise
   * @memberOf module:ui-decorators/ui/interfaces
   */
  isVisible(): boolean;

  /**
   * @description Displays a loading overlay with the specified message and options.
   * @summary Creates and presents a loading overlay. If one is already visible,
   * updates the existing overlay instead of creating a new one.
   *
   * @param {string | Record<string, any>} message - The message to display, or a full options object
   * @param {Record<string, any>} [options] - Optional configuration for the loading overlay
   * @returns {Promise<void>} Resolves when the loading overlay is displayed
   * @memberOf module:ui-decorators/ui/interfaces
   */
  show(message: string | Record<string, any>, options?: Record<string, any>): Promise<void>;

  /**
   * @description Updates the loading overlay message and optionally tracks progress.
   * @summary Modifies the current overlay message. When {@link isProgressUpdate} is a number,
   * displays progress as a percentage. When no overlay exists, creates one with a default duration.
   *
   * @param {string} message - The new message to display
   * @param {boolean | number} [isProgressUpdate=false] - Progress percentage (number) or flag (boolean)
   * @returns {Promise<void>} Resolves when the update is applied
   * @memberOf module:ui-decorators/ui/interfaces
   */
  update(message: string, isProgressUpdate?: boolean | number): Promise<void>;

  /**
   * @description Removes the loading overlay from display.
   * @summary Dismisses the active loading overlay and resets internal progress state.
   * Safe to call even when no overlay is active.
   *
   * @returns {Promise<void>} Resolves when the overlay is dismissed
   * @memberOf module:ui-decorators/ui/interfaces
   */
  remove(): Promise<void>;

  /**
   * @description Merges custom options with the default loading configuration.
   * @summary Combines defaults with user-provided options. The {@link message} parameter
   * takes precedence over any message set in {@link options}.
   *
   * @param {Record<string, any>} [options={}] - Custom loading options to merge
   * @param {string} [message] - Optional message override
   * @returns {Promise<Record<string, any>>} The merged configuration object
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getOptions(options?: Record<string, any>, message?: string): Promise<Record<string, any>>;

  /**
   * @description Retrieves the current loading message.
   * @summary Returns the message currently being displayed in the active loading overlay.
   *
   * @returns {Promise<string>} Resolves to the current loading message
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getMessage(): Promise<string>;
}
