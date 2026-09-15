/**
 * @description Interface for modal presentation and lifecycle control in Decaf UI.
 * @summary Describes the public contract for modal configuration, presentation,
 * dismissal, and event handling used by the modal component layer.
 *
 * @module ui/interfaces/IDecafModal
 * @memberOf module:ui-decorators
 */

import { Model } from "@decaf-ts/decorator-validation";
import { DecafComponent } from "../DecafComponent";

export interface IDecafModal extends DecafComponent<Model> {
  /**
   * @description Reference to the modal instance controller.
   * @summary Exposes the dismiss capability used to close the modal programmatically.
   */
  modal?: any;

  /**
   * @description Title displayed in the modal header.
   * @summary Optional header text rendered above the modal content.
   */
  title?: string;

  /**
   * @description Controls whether the modal is open.
   * @summary Signals the current presentation state of the modal.
   */
  isOpen: boolean;

  /**
   * @description Optional tag used to identify the modal instance.
   * @summary Provides a stable identifier that can be used by rendering and lookup logic.
   */
  tag?: string;

  /**
   * @description Additional modal configuration options.
   * @summary Stores custom configuration passed into modal creation and presentation.
   */
  options?: Record<string, unknown>;

  /**
   * @description Global configuration values available to the modal.
   * @summary Holds shared runtime data that can be consumed by modal content and handlers.
   */
  globals?: Record<string, unknown>;

  /**
   * @description Inline content rendered inside the modal body.
   * @summary Accepts HTML text or DOM content to be sanitized and displayed.
   */
  inlineContent?: string | any;

  /**
   * @description Position of the inline content within the modal.
   * @summary Determines whether inline content appears before or after the main body.
   */
  inlineContentPosition: "top" | "bottom";

  /**
   * @description Enables fullscreen presentation for the modal.
   * @summary Controls whether the modal occupies the entire viewport.
   */
  fullscreen: boolean;

  /**
   * @description Enables expandable presentation for the modal.
   * @summary Signals whether the modal can be expanded by the user.
   */
  expandable: boolean;

  /**
   * @description Controls border rendering for the modal content.
   * @summary Enables or disables visual borders according to the component styling rules.
   */
  borders: boolean;

  /**
   * @description Enables lightbox presentation for the modal.
   * @summary Controls whether the modal is displayed with a lightbox-style overlay.
   */
  lightBox: boolean;

  /**
   * @description Controls the transparency of the modal header.
   * @summary Indicates whether the modal header should be rendered with a transparent background.
   */
  headerTransparent: boolean;

  /**
   * @description Sets the background color of the modal header.
   * @summary Stores the header color token used to style the modal header region.
   */
  headerBackground: string;

  /**
   * @description Controls the visibility of the modal header.
   * @summary Indicates whether the header section should be rendered.
   */
  showHeader: boolean;

  /**
   * @description Controls the visibility of the modal close button.
   * @summary Indicates whether the close action should be shown in the header.
   */
  showCloseButton: boolean;

  /**
   * @description Emits modal dismiss details.
   * @summary Notifies consumers when the modal is about to be dismissed.
   */
  willDismissEvent: {
    emit(value: unknown): void;
  };

  /**
   * @description Indicates whether the modal content is expanded.
   * @summary Tracks the current expanded or collapsed state of the modal body.
   */
  expanded: boolean;

  /**
   * @description Defines the icon color used by the modal.
   * @summary Stores the color token used for modal icons and actions.
   */
  iconColor: string;

  /**
   * @description Initializes the modal component state.
   * @summary Prepares the modal before presentation and applies inline content sanitization.
   *
   * @return {Promise<void>} Resolves when initialization completes.
   */
  ngOnInit(): Promise<void>;

  /**
   * @description Prepares the modal with the provided options.
   * @summary Merges defaults, applies global runtime settings, and registers custom handlers.
   *
   * @param {Record<string, unknown>} [options={}] Additional modal initialization options.
   * @return {Promise<void>} Resolves when preparation completes.
   */
  prepare(options?: Record<string, unknown>): Promise<void>;

  /**
   * @description Sanitizes and normalizes inline content.
   * @summary Converts DOM content to HTML text when needed and prepares it for safe rendering.
   *
   * @return {void} Does not return a value.
   */
  parseInlineContent(): void;

  /**
   * @description Creates and presents the modal.
   * @summary Prepares the modal, presents it, and returns the active modal instance contract.
   *
   * @param {Record<string, unknown>} [props={}] Modal properties used during creation.
   * @return {Promise<any>} Resolves with the modal instance contract.
   */
  create(props?: Record<string, unknown>): Promise<any>;

  /**
   * @description Presents the modal.
   * @summary Sets the modal as visible and triggers any presentation-time updates.
   *
   * @return {Promise<void>} Resolves when the modal is visible.
   */
  present(): Promise<void>;

  /**
   * @description Handles a custom event triggered by the modal.
   * @summary Stops event propagation when needed and routes the event to confirm or cancel actions.
   *
   * @param {any} event Event payload emitted by the modal.
   * @return {Promise<void>} Resolves when event handling completes.
   */
  handleEvent(event: any): Promise<void>;

  /**
   * @description Handles the modal dismiss event.
   * @summary Emits the dismiss payload and returns the overlay detail object to callers.
   *
   * @param {any} event Dismiss event emitted by the modal.
   * @return {Promise<{ data?: unknown }>} Resolves with the dismiss event details.
   */
  handleWillDismiss(event: any): Promise<{
    data?: unknown;
  }>;

  /**
   * @description Toggles the expanded state of the modal.
   * @summary Switches between expanded and collapsed presentation modes.
   *
   * @return {void} Does not return a value.
   */
  handleExpandToggle(): void;

  /**
   * @description Cancels the modal.
   * @summary Dismisses the modal using the cancel role.
   *
   * @return {Promise<void>} Resolves when the modal has been dismissed.
   */
  cancel(): Promise<void>;

  /**
   * @description Confirms the modal.
   * @summary Dismisses the modal using the confirm role and optional event data.
   *
   * @param {any} [event] Optional event payload forwarded to the dismiss action.
   * @return {Promise<void>} Resolves when the modal has been dismissed.
   */
  confirm(event?: any): Promise<void>;
}
