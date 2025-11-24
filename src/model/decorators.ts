import { UIKeys } from "../ui/constants";
import {
  UIHandlerMetadata,
  UIListModelMetadata,
  UIModelMetadata,
} from "../ui/types";
import { UIMediaBreakPoints } from "../ui/constants";
import { IPagedComponentProperties } from "../ui/interfaces";
import { apply, Metadata, metadata } from "@decaf-ts/decoration";

/**
 * @description Decorator that tags a class as a UI model
 * @summary Adds rendering capabilities to a model class by providing a render method
 * This decorator applies metadata to the class that enables it to be rendered by the UI rendering engine.
 * The model will be rendered with the specified tag and properties.
 *
 * @param {string} [tag] The HTML tag to use when rendering this model (defaults to class name)
 * @param {Record<string, any>} [props] Additional properties to pass to the rendered element
 * @return {Function} A class decorator function
 *
 * @function uimodel
 * @category Class Decorators
 *
 * @example
 * // Basic usage with default tag (class name)
 * @uimodel()
 * class UserProfile extends Model {
 *   @attribute()
 *   name: string;
 *
 *   @attribute()
 *   email: string;
 * }
 *
 * // Usage with custom tag and properties
 * @uimodel('div', { class: 'user-card' })
 * class UserCard extends Model {
 *   @attribute()
 *   username: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uimodel
 *   participant constructor
 *   participant instance
 *   System->>uimodel:do(constructor)
 *   uimodel->>constructor: Executes the constructor
 *   constructor->>uimodel: returns instance
 *   uimodel->>instance: adds the render method
 *   uimodel->>System: returns UIModel instance
 */
export function uimodel(tag?: string, props?: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (original: any, propertyKey?: any) => {
    const meta: UIModelMetadata = {
      tag: tag || original.name,
      props: props,
    };
    return metadata(
      Metadata.key(UIKeys.REFLECT, UIKeys.UIMODEL),
      meta
    )(original);
  };
}

/**
 * @description Decorator that specifies which rendering engine to use for a model
 * @summary Associates a model with a specific rendering engine implementation
 * This decorator allows you to override the default rendering engine for a specific model class,
 * enabling different rendering strategies for different models.
 *
 * @param {string} engine The name of the rendering engine to use
 * @return {Function} A class decorator function
 *
 * @function renderedBy
 * @category Class Decorators
 *
 * @example
 * // Specify a custom rendering engine for a model
 * @uimodel()
 * @renderedBy('react')
 * class ReactComponent extends Model {
 *   @attribute()
 *   title: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant renderedBy
 *   participant Model
 *   participant RenderingEngine
 *   System->>renderedBy: apply to Model
 *   renderedBy->>Model: adds engine metadata
 *   Model->>RenderingEngine: uses specified engine
 *   RenderingEngine->>System: renders with custom engine
 */
export function renderedBy(engine: string) {
  return apply(
    metadata(Metadata.key(UIKeys.REFLECT, UIKeys.RENDERED_BY), engine)
  );
}

/**
 * @description Decorator that tags a model as a list item for UI rendering
 * @summary Specifies how a model should be rendered when displayed in a list context
 * This decorator applies metadata to the class that enables it to be rendered as a list item
 * by the UI rendering engine. The model will be rendered with the specified tag and properties
 * when it appears in a list.
 *
 * @param {string} [tag] The HTML tag to use when rendering this model as a list item (defaults to class name)
 * @param {Record<string, any>} [props] Additional properties to pass to the rendered list item element
 * @return {Function} A class decorator function
 *
 * @function uilistmodel
 * @category Class Decorators
 *
 * @example
 * // Basic usage with default tag (class name)
 * @uimodel()
 * @uilistmodel()
 * class TodoItem extends Model {
 *   @attribute()
 *   title: string;
 *
 *   @attribute()
 *   completed: boolean;
 * }
 *
 * // Usage with custom tag and properties
 * @uimodel()
 * @uilistmodel('li', { class: 'list-group-item' })
 * class ListItem extends Model {
 *   @attribute()
 *   text: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uilistmodel
 *   participant Model
 *   participant RenderingEngine
 *   System->>uilistmodel: apply to Model
 *   uilistmodel->>Model: adds list item metadata
 *   Model->>RenderingEngine: uses list item metadata when in list context
 *   RenderingEngine->>System: renders with list item styling
 */
export function uilistmodel(name?: string, props?: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (original: any, propertyKey?: any) => {
    const meta: UIListModelMetadata = {
      item: {
        tag: name || original.name,
        props: props,
      },
    };
    return metadata(
      Metadata.key(UIKeys.REFLECT, UIKeys.UILISTMODEL),
      meta
    )(original);
  };
}

/**
 * @description Decorator that adds event handlers to a UI model
 * @summary Specifies event handlers that should be attached to the rendered model
 * This decorator allows you to define event handlers that will be automatically
 * attached to the rendered UI element. The handlers are passed as properties
 * to the rendering engine.
 *
 * @param {Record<string, any>} [props] Object containing event handler functions and other properties
 * @return {Function} A class decorator function
 *
 * @function uihandlers
 * @category Class Decorators
 *
 * @example
 * // Add event handlers to a model
 * @uimodel('button')
 * @uihandlers({
 *   onClick: (event) => console.log('Button clicked'),
 *   onMouseOver: (event) => console.log('Mouse over button'),
 *   disabled: false
 * })
 * class ClickableButton extends Model {
 *   @attribute()
 *   label: string;
 * }
 *
 * // Add form submission handlers
 * @uimodel('form')
 * @uihandlers({
 *   onSubmit: (event) => {
 *     event.preventDefault();
 *     console.log('Form submitted');
 *   },
 *   onReset: (event) => console.log('Form reset')
 * })
 * class ContactForm extends Model {
 *   @attribute()
 *   email: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uihandlers
 *   participant Model
 *   participant RenderingEngine
 *   participant UI
 *   System->>uihandlers: apply to Model
 *   uihandlers->>Model: adds handler metadata
 *   Model->>RenderingEngine: requests rendering with handlers
 *   RenderingEngine->>UI: renders element with event handlers attached
 *   UI->>Model: triggers handlers on events
 */
export function uihandlers(props?: Record<string, any>) {
  return (original: any) => {
    const meta: UIHandlerMetadata = {
      handlers: props,
    };
    return metadata(
      Metadata.key(UIKeys.REFLECT, UIKeys.HANDLERS),
      meta
    )(original);
  };
}

/**
 * @description Decorator that creates a layout container with grid specifications
 * @summary Combines UI model functionality with layout grid configuration
 * This decorator creates a UI model that acts as a layout container with specified
 * column and row configurations. It's a convenience decorator that combines.
 * @uimodel with layout-specific properties for responsive grid layouts.
 *
 * @param {string} tag The HTML tag to use for the layout container
 * @param {number|boolean} [colsMode=1] Number of columns in the grid layout or a boolean for flex mode
 * @param {number|string[]} [rows=1] Number of rows or array of row definitions
 * @param {UIMediaBreakPoints} [breakpoint='m'] Media breakpoint for responsive behavior
 * @return {Function} A class decorator function
 *
 * @function uilayout
 * @category Class Decorators
 *
 * @example
 * // Create a simple 2-column layout
 * @uilayout('div', 2, 3)
 * class TwoColumnLayout extends Model {
 *   @attribute()
 *   @uilayoutprop(1, 1)
 *   header: string;
 *
 *   @attribute()
 *   @uilayoutprop(1, 2)
 *   leftContent: string;
 *
 *   @attribute()
 *   @uilayoutprop(2, 2)
 *   rightContent: string;
 * }
 *
 * // Create a responsive layout with custom breakpoint
 * @uilayout('section', true, 2, 'l')
 * class ResponsiveLayout extends Model {
 *   @attribute()
 *   @uilayoutprop(1, 1)
 *   title: string;
 *
 *   @attribute()
 *   @uilayoutprop(2, 1)
 *   subtitle: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uilayout
 *   participant uimodel
 *   participant Model
 *   participant RenderingEngine
 *   System->>uilayout: apply to Model
 *   uilayout->>uimodel: call with layout props
 *   uimodel->>Model: adds model metadata with layout config
 *   Model->>RenderingEngine: requests rendering as layout container
 *   RenderingEngine->>System: renders grid layout with specified dimensions
 */
export function uilayout(
  tag: string,
  colsMode: number | boolean = 1,
  rows: number | string[] = 1,
  props: any = {}
) {
  return (original: any, propertyKey?: any) => {
    return uimodel(
      tag,
      Object.assign({
        ...(typeof colsMode === "boolean"
          ? {
              flexMode: colsMode,
              cols: 1,
            }
          : {
              flexMode: false,
              cols: colsMode,
            }),
        rows,
        ...Object.assign({ breakpoint: UIMediaBreakPoints.LARGE }, props),
      })
    )(original, propertyKey);
  };
}

/**
 * @description Decorator that creates a multi-step form model with page navigation
 * @summary Combines UI model functionality with stepped/wizard form configuration
 * This decorator creates a UI model that acts as a multi-step container with page navigation
 * capabilities. It is designed for wizard-style forms or multi-page workflows where users
 * progress through sequential steps. The decorator combines @uimodel with page-specific
 * properties and optional pagination controls.
 *
 * @param {string} tag - The HTML tag to use for the stepped form container
 * @param {number | IPagedComponentProperties[]} [pages=1] - Number of pages or an array of page definitions with metadata
 * @param {boolean} [paginated=false] - Whether to show pagination controls (e.g., prev/next buttons)
 * @param {any} [props={}] - Additional properties to pass to the container element
 * @return {Function} A class decorator function
 *
 * @function uisteppedmodel
 * @category Class Decorators
 *
 * @example
 * // Create a simple 3-step wizard form
 * @uisteppedmodel('div', 3, true)
 * class RegistrationWizard extends Model {
 *   // Page 1: Personal Info
 *   @attribute()
 *   @uipageprop(1)
 *   firstName: string;
 *
 *   @attribute()
 *   @uipageprop(1)
 *   lastName: string;
 *
 *   // Page 2: Contact Info
 *   @attribute()
 *   @uipageprop(2)
 *   email: string;
 *
 *   @attribute()
 *   @uipageprop(2)
 *   phone: string;
 *
 *   // Page 3: Confirmation
 *   @attribute()
 *   @uipageprop(3)
 *   acceptTerms: boolean;
 * }
 *
 * // Create a wizard with custom page definitions
 * @uisteppedmodel('section', [
 *   { title: 'Personal', icon: 'user' },
 *   { title: 'Contact', icon: 'email' },
 *   { title: 'Review', icon: 'check' }
 * ], true, { class: 'wizard-container' })
 * class OnboardingWizard extends Model {
 *   @attribute()
 *   @uipageprop(1)
 *   username: string;
 *
 *   @attribute()
 *   @uipageprop(2)
 *   email: string;
 *
 *   @attribute()
 *   @uipageprop(3)
 *   preferences: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uisteppedmodel
 *   participant uimodel
 *   participant Model
 *   participant RenderingEngine
 *   participant PaginationController
 *   System->>uisteppedmodel: apply to Model
 *   uisteppedmodel->>uimodel: call with page config
 *   uimodel->>Model: adds model metadata with pages and pagination
 *   Model->>RenderingEngine: requests rendering as stepped form
 *   RenderingEngine->>PaginationController: initialize page navigation
 *   PaginationController->>System: renders current page with navigation controls
 */
export function uisteppedmodel(
  tag: string,
  pages: number | IPagedComponentProperties[] = 1,
  paginated: boolean = false,
  props: any = {}
) {
  let pageTitles: IPagedComponentProperties[] = [];
  if (typeof pages === "object") {
    pageTitles = pages as IPagedComponentProperties[];
    pages = pageTitles.length;
  }
  return uimodel(tag, {
    pages,
    paginated,
    pageTitles,
    props,
  });
}

