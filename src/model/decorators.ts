import { UIKeys } from "../ui/constants";
import { apply, metadata } from "@decaf-ts/reflection";
import { RenderingEngine } from "../ui/Rendering";
import { UIListItemModelMetadata, UIMediaBreakPoints, UIModelMetadata } from "../ui/types";

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
    return metadata(RenderingEngine.key(UIKeys.UIMODEL), meta)(original);
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
  return apply(metadata(RenderingEngine.key(UIKeys.RENDERED_BY), engine));
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
 * @function uilistitem
 * @category Class Decorators
 *
 * @example
 * // Basic usage with default tag (class name)
 * @uimodel()
 * @uilistitem()
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
 * @uilistitem('li', { class: 'list-group-item' })
 * class ListItem extends Model {
 *   @attribute()
 *   text: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uilistitem
 *   participant Model
 *   participant RenderingEngine
 *   System->>uilistitem: apply to Model
 *   uilistitem->>Model: adds list item metadata
 *   Model->>RenderingEngine: uses list item metadata when in list context
 *   RenderingEngine->>System: renders with list item styling
 */
export function uilistitem(tag?: string, props?: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (original: any, propertyKey?: any) => {
    const meta: UIListItemModelMetadata = {
      item: {
        tag: tag || original.name,
        props: props,
      },
    };
    return metadata(RenderingEngine.key(UIKeys.UILISTITEM), meta)(original);
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
    const meta = {
      handlers: props
    };
    return metadata(RenderingEngine.key(UIKeys.HANDLERS), meta)(original);
  };
}

/**
 * @description Decorator that creates a layout container with grid specifications
 * @summary Combines UI model functionality with layout grid configuration
 * This decorator creates a UI model that acts as a layout container with specified
 * column and row configurations. It's a convenience decorator that combines
 * @uimodel with layout-specific properties for responsive grid layouts.
 *
 * @param {string} tag The HTML tag to use for the layout container
 * @param {number} [cols=1] Number of columns in the grid layout
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
 *   @uilayoutitem(1, 1)
 *   header: string;
 *
 *   @attribute()
 *   @uilayoutitem(1, 2)
 *   leftContent: string;
 *
 *   @attribute()
 *   @uilayoutitem(2, 2)
 *   rightContent: string;
 * }
 *
 * // Create a responsive layout with custom breakpoint
 * @uilayout('section', 3, 2, 'l')
 * class ResponsiveLayout extends Model {
 *   @attribute()
 *   @uilayoutitem(1, 1)
 *   title: string;
 *
 *   @attribute()
 *   @uilayoutitem(2, 1)
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
export function uilayout(tag: string, cols: number = 1, rows: number | string[] = 1, breakpoint: UIMediaBreakPoints = 'm') {
  return (original: any, propertyKey?: any) => {
    return uimodel(tag, {cols, rows, breakpoint})(original, propertyKey);
  };
}