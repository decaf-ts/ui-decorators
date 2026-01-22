/**
 * @interface IDecafLoadingOptions
 * @description Declarative contract for configuring Ionic loading overlays in Decaf apps.
 * @summary Wraps Ionic `LoadingOptions`, exposing message customization, visual styling,
 * interaction rules, and accessibility hooks used by `NgxLoadingComponent`.
 */
export interface IDecafLoadingOptions {
  /**
   * @description Text shown inside the loading overlay.
   * @summary Accepts plain strings or HTML; default comes from the loader implementation.
   */
  message?: string;

  /**
   * @description CSS class names applied to the overlay host element.
   * @summary Supports a single class or a list for granular styling overrides.
   */
  cssClass?: string | string[];

  /**
   * @description Toggles the semi-transparent backdrop behind the loader.
   * @summary Disable when you want background interaction or a lighter visual footprint.
   */
  showBackdrop?: boolean;

  /**
   * @description Milliseconds before the overlay auto-dismisses.
   * @summary Omit to keep the loader visible until manually removed.
   */
  duration?: number;

  /**
   * @description Enables the default translucent background effect on iOS.
   * @summary Improves platform consistency for Cupertino-themed experiences.
   */
  translucent?: boolean;

  /**
   * @description Controls whether enter/leave transitions play.
   * @summary Set to false for instant presentation when animation cost must be minimized.
   */
  animated?: boolean;

  /**
   * @description Allows users to tap the backdrop to dismiss the overlay.
   * @summary Useful for non-blocking status indicators or cancellable flows.
   */
  backdropDismiss?: boolean;

  /**
   * @description Automatically closes the keyboard when the loader presents.
   * @summary Prevents overlapping input states during lengthy operations.
   */
  keyboardClose?: boolean;

  /**
   * @description Custom identifier injected into the DOM node.
   * @summary Handy for testing, analytics, or cross-component coordination.
   */
  id?: string;

  /**
   * @description Arbitrary HTML attributes passed to the overlay element.
   * @summary Use to attach ARIA labels, automation hooks, or data attributes.
   */
  htmlAttributes?: {
    [key: string]: any;
  };
}