/**
 * @description Contract for router helpers used by Decaf UI components.
 * @summary Defines navigation and query-parameter utilities that abstract the
 * underlying routing implementation for UI components and services.
 *
 * @interface IDecafRouter
 * @since 2026-06-19
 * @memberOf module:ui-decorators/ui/interfaces
 */
export interface IDecafRouter {
  /**
   * @description Parses query parameters from the current route.
   * @summary Extracts specified query parameters from the current route and returns them
   * as an array of key-value pairs. When no params are provided, all query parameters
   * are extracted.
   *
   * @param {string | string[]} [params] - The parameter name(s) to extract from the route
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  parseAllQueryParams(params?: string | string[]): Record<string, any>[];

  /**
   * @description Checks if a query parameter exists in the current route.
   * @summary Determines whether a specific query parameter is present in the current
   * route's query parameters.
   *
   * @param {string} param - The name of the query parameter to check
   * @return {boolean} True if the parameter exists, false otherwise
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  hasQueryParam(param: string): boolean;

  /**
   * @description Retrieves a specific query parameter from the current route.
   * @summary Extracts a single query parameter from the current route and returns it
   * as a key-value pair, or undefined if not found.
   *
   * @param {string} param - The name of the query parameter to retrieve
   * @return {Record<string, any> | undefined} A key-value object representing the parameter, or undefined if not found
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getQueryParam(param: string): Record<string, any> | undefined;

  /**
   * @description Retrieves the value of a specific query parameter.
   * @summary Extracts only the string value of a single query parameter from the current
   * route, or undefined if not found.
   *
   * @param {string} param - The name of the query parameter to retrieve
   * @return {string | undefined} The value of the parameter, or undefined if not found
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getQueryParamValue(param: string): string | undefined;

  /**
   * @description Retrieves the last segment of the current URL.
   * @summary Extracts the final path segment from the current URL. Falls back to the
   * browser's window location when the Angular Router URL is unavailable.
   *
   * @return {string} The last segment of the current URL path
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getLastUrlSegment(): string;

  /**
   * @description Retrieves the current URL of the application.
   * @summary Returns the current URL path, stripping the leading forward slash.
   * Falls back to the browser's pathname when the Angular Router returns only '/'.
   *
   * @return {string} The current URL without the leading slash
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getCurrentUrl(): string;

  /**
   * @description Retrieves the URL of the previous page.
   * @summary Extracts the URL of the previous page from the router's navigation history,
   * useful for back navigation and tracking the user's navigation path.
   *
   * @return {string} The URL of the previous page
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  getPreviousUrl(): string;

  /**
   * @description Navigates back to the previous page.
   * @summary Dispatches a {@link ComponentEventNames.BackButtonClickEvent} custom event
   * and then triggers browser back navigation via Angular's Location service.
   *
   * @return {void}
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  backToLastPage(): void;

  /**
   * @description Navigates to a specified page.
   * @summary Triggers navigation to the given page using the Ionic NavController,
   * supporting ROOT, FORWARD, and BACK directions.
   *
   * @param {string} page - The target page path
   * @param {"forward" | "back" | "root"} [direction] - The direction of navigation (default: FORWARD)
   * @param {Record<string, any>} [options] - Additional navigation options
   * @return {Promise<boolean>} Resolves to true if navigation succeeds, false otherwise
   *
   * @memberOf module:ui-decorators/ui/interfaces
   */
  navigate(
    page: string,
    direction?: "forward" | "back" | "root",
    options?: Record<string, any>
  ): Promise<boolean>;
}
