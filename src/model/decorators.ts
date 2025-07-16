import { UIKeys } from "../ui/constants";
import { apply, metadata } from "@decaf-ts/reflection";
import { RenderingEngine } from "../ui/Rendering";
import { UIListItemModelMetadata, UIModelMetadata } from "../ui/types";

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


export function uihandlers(props?: Record<string, any>) {
  return (original: any) => {
    const meta = {
      handlers: props
    };
    return metadata(RenderingEngine.key(UIKeys.HANDLERS), meta)(original);
  };
}