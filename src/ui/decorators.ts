import { UIKeys } from "./constants";
import { propMetadata } from "@decaf-ts/decoration";
import {
  CrudOperationKeys,
  UIElementMetadata,
  UILayoutCol,
  UILayoutPropMetadata,
  UIListPropMetadata,
  UIPropMetadata,
} from "./types";
import { OperationKeys } from "@decaf-ts/db-decorators";
import { getUIAttributeKey } from "./utils";

/**
 * @description Decorator that hides a property during specific CRUD operations
 * @summary Controls property visibility based on operation type
 * This decorator allows you to specify which CRUD operations should hide a property
 * in the UI. The property will only be visible during operations not specified.
 *
 * @param operations - The CRUD operations during which the property should be hidden
 * @return {Function} A property decorator function
 *
 * @function hideOn
 * @category Property Decorators
 *
 * @example
 * // Hide the password field during READ operations
 * class User {
 *   @attribute()
 *   username: string;
 *
 *   @attribute()
 *   @hideOn(OperationKeys.READ)
 *   password: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant hideOn
 *   participant RenderingEngine
 *   participant UI
 *   Model->>hideOn: Apply to property
 *   hideOn->>Model: Add hidden metadata
 *   RenderingEngine->>Model: Check if property should be hidden
 *   Model->>RenderingEngine: Return hidden operations
 *   RenderingEngine->>UI: Render or hide based on current operation
 */
export function hideOn(...operations: CrudOperationKeys[]) {
  return function hideOn(object: any, propertyKey?: any) {
    return propMetadata(
      getUIAttributeKey(propertyKey, UIKeys.HIDDEN),
      operations
    )(object, propertyKey);
  };
}

/**
 * @description Decorator that sets the order of a UI element
 * @summary Specifies the rendering order for UI components
 * This decorator applies metadata to the property or class, indicating its order in the UI rendering sequence.
 *
 * @param {number} [order=1] The order value for the UI element (default is 1)
 * @return {Function} A property or class decorator function
 *
 * @function uiorder
 * @category Property Decorators
 *
 * @example
 * // Set order for a field
 * @uiorder(2)
 * fieldName: string;
 *
 * // Set order for a class
 * @uiorder(1)
 * class UserProfile { ... }
 *
 * @mermaid
 * sequenceDiagram
 *   participant System
 *   participant uiorder
 *   participant property
 *   System->>uiorder:do(property)
 *   uiorder->>property: sets order metadata
 *   uiorder->>System: returns decorated property
 */
export function uiorder(order: number = 1) {
  return function uiorder(object: any, propertyKey?: any) {
    return propMetadata(getUIAttributeKey(propertyKey, UIKeys.ORDER), order)(
      object,
      propertyKey
    );
  };
}

/**
 * @description Decorator that completely hides a property in all UI operations
 * @summary Makes a property invisible in all CRUD operations
 * This decorator is a convenience wrapper around hideOn that hides a property
 * during all CRUD operations (CREATE, READ, UPDATE, DELETE).
 *
 * @return {Function} A property decorator function
 *
 * @function hidden
 * @category Property Decorators
 *
 * @example
 * // Completely hide the internalId field in the UI
 * class Product {
 *   @attribute()
 *   name: string;
 *
 *   @attribute()
 *   @hidden()
 *   internalId: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant hidden
 *   participant hideOn
 *   participant RenderingEngine
 *   Model->>hidden: Apply to property
 *   hidden->>hideOn: Call with all operations
 *   hideOn->>Model: Add hidden metadata
 *   RenderingEngine->>Model: Check if property should be hidden
 *   Model->>RenderingEngine: Return all operations
 *   RenderingEngine->>UI: Always hide property
 */
export function hidden() {
  return hideOn(
    OperationKeys.CREATE,
    OperationKeys.READ,
    OperationKeys.UPDATE,
    OperationKeys.DELETE
  );
}

/**
 * @description Decorator that specifies how a property should be rendered as a UI element
 * @summary Maps a model property to a specific UI element with custom properties
 * This decorator allows you to define which HTML element or component should be used
 * to render a specific property, along with any additional properties to pass to that element.
 *
 * @param {string} tag The HTML element or component tag name to use for rendering
 * @param {Record<string, any>} [props] Additional properties to pass to the element
 * @param {boolean} [serialize=false] Whether the property should be serialized
 * @return {Function} A property decorator function
 *
 * @function uielement
 * @category Property Decorators
 *
 * @example
 * // Render a property as a text input
 * class LoginForm {
 *   @attribute()
 *   @uielement('input', { type: 'text', placeholder: 'Enter username' })
 *   username: string;
 *
 *   @attribute()
 *   @uielement('input', { type: 'password', placeholder: 'Enter password' })
 *   password: string;
 *
 *   @attribute()
 *   @uielement('button', { class: 'btn-primary' })
 *   submit: string = 'Login';
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uielement
 *   participant RenderingEngine
 *   participant UI
 *   Model->>uielement: Apply to property
 *   uielement->>Model: Add element metadata
 *   RenderingEngine->>Model: Get element metadata
 *   Model->>RenderingEngine: Return tag and props
 *   RenderingEngine->>UI: Render with specified element
 */
export function uielement(
  tag: string,
  props?: Record<string, any>,
  serialize: boolean = false
) {
  return (original: any, propertyKey?: any) => {
    const metadata: UIElementMetadata = {
      tag: tag,
      serialize: serialize,
      props: Object.assign({}, props || {}, {
        name: propertyKey,
      }),
    };

    return propMetadata(
      getUIAttributeKey(propertyKey, UIKeys.ELEMENT),
      metadata
    )(original, propertyKey);
  };
}

/**
 * @description Decorator that maps a model property to a UI component property
 * @summary Specifies how a property should be passed to a UI component
 * This decorator allows you to define how a model property should be mapped to
 * a property of the UI component when rendering. It requires the class to be
 * decorated with @uimodel.
 *
 * @param {string} [propName] The name of the property to pass to the component (defaults to the property key)
 * @param {boolean} [stringify=false] Whether to stringify the property value
 * @return {Function} A property decorator function
 *
 * @function uiprop
 * @category Property Decorators
 *
 * @example
 * // Map model properties to component properties
 * @uimodel('user-profile')
 * class UserProfile {
 *   @attribute()
 *   @uiprop() // Will be passed as 'fullName' to the component
 *   fullName: string;
 *
 *   @attribute()
 *   @uiprop('userEmail') // Will be passed as 'userEmail' to the component
 *   email: string;
 *
 *   @attribute()
 *   @uiprop('userData', true) // Will be passed as stringified JSON
 *   userData: Record<string, any>;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uiprop
 *   participant RenderingEngine
 *   participant Component
 *   Model->>uiprop: Apply to property
 *   uiprop->>Model: Add prop metadata
 *   RenderingEngine->>Model: Get prop metadata
 *   Model->>RenderingEngine: Return prop name and stringify flag
 *   RenderingEngine->>Component: Pass property with specified name
 */
export function uiprop(
  propName: string | undefined = undefined,
  stringify: boolean = false
) {
  return (target: any, propertyKey?: any) => {
    const metadata: UIPropMetadata = {
      name: propName || propertyKey,
      stringify: stringify,
    };
    propMetadata(getUIAttributeKey(propertyKey, UIKeys.PROP), metadata)(
      target,
      propertyKey
    );
  };
}

/**
 * @description Decorator that maps a nested model property to a UI component property.
 * @summary Defines how a parent component should render the child model when nested.
 *
 * This decorator is used to decorate properties that are nested models.
 * When applied, it allows overriding the default tag of the child model with the provided one,
 * enabling different rendering behavior when the model acts as a child (nested)
 * compared to when it is rendered as the parent model.
 *
 * It requires the class to be decorated with `@uimodel`.
 *
 * @param {string} clazz The model class name to pass to the component (defaults to the property key).
 * @param {string} tag The HTML element or component tag name to override the UI tag of the nested model
 * @param {Record<string, any>} [props] Additional properties to pass to the element
 * @param {boolean} [serialize=false] Whether the property should be serialized
 * @return {Function} A property decorator function.
 *
 * @function uichild
 * @category Property Decorators
 *
 * @example
 * // Map a nested model to a component property with a different tag when nested
 * @uimodel('address-component')
 * class Address {
 *   @attribute()
 *   street: string;
 *
 *   @attribute()
 *   city: string;
 * }
 *
 * @uimodel('user-profile')
 * class UserProfile {
 *   @attribute()
 *   @uichild(Address.name, 'address-child-component')
 *   address: Address;
 * }
 *
 * // In this example, the Address model has the default tag 'address-component' when rendered as a root component,
 * // but when used inside UserProfile, it is rendered with the overridden tag 'address-child-component'
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uichild
 *   participant RenderingEngine
 *   participant Component
 *   Model->>uichild: Apply to property
 *   uichild->>Model: Add child metadata
 *   RenderingEngine->>Model: Get child metadata
 *   Model->>RenderingEngine: Return prop name, stringify flag, and child tag override
 *   RenderingEngine->>Component: Pass property with specified name and render with overridden tag if nested
 */

export function uichild(
  clazz: string,
  tag: string,
  props: Record<string, any> = {},
  isArray: boolean = false,
  serialize: boolean = false
) {
  return (target: any, propertyKey?: any) => {
    const metadata: UIElementMetadata = {
      tag: tag,
      serialize: serialize,
      props: Object.assign(
        {},
        props || {},
        {
          name: clazz || propertyKey,
        },
        isArray
          ? { customTypes: [Array.name], multiple: true }
          : { multiple: props?.multiple || false }
      ),
    };

    propMetadata(getUIAttributeKey(propertyKey, UIKeys.CHILD), metadata)(
      target,
      propertyKey
    );
  };
}

/**
 * @description Decorator that maps a model property to a list item component
 * @summary Specifies how a property should be rendered in a list context
 * This decorator allows you to define how a model property containing a list
 * should be rendered. It requires the class to be decorated with @uilistmodel.
 *
 * @param {string} [propName] The name of the property to pass to the list component (defaults to the property key)
 * @param {Record<string, any>} [props] Additional properties to pass to the list container
 * @return {Function} A property decorator function
 *
 * @function uilistprop
 * @category Property Decorators
 *
 * @example
 * // Define a list property with custom rendering
 * @uimodel('todo-list')
 * class TodoList {
 *   @attribute()
 *   title: string;
 *
 *   @attribute()
 *   @uilistprop('items', { class: 'todo-items-container' })
 *   items: TodoItem[];
 * }
 *
 * @uilistmodel('li', { class: 'todo-item' })
 * class TodoItem extends Model {
 *   @attribute()
 *   text: string;
 *
 *   @attribute()
 *   completed: boolean;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uilistprop
 *   participant RenderingEngine
 *   participant ListContainer
 *   participant ListItems
 *   Model->>uilistprop: Apply to property
 *   uilistprop->>Model: Add list prop metadata
 *   RenderingEngine->>Model: Get list prop metadata
 *   Model->>RenderingEngine: Return prop name and container props
 *   RenderingEngine->>ListContainer: Create container with props
 *   RenderingEngine->>ListItems: Render each item using @uilistmodel
 *   ListContainer->>RenderingEngine: Return rendered list
 */
export function uilistprop(
  propName: string | undefined = undefined,
  props?: Record<string, any>
) {
  return (target: any, propertyKey?: any) => {
    const metadata: Partial<UIListPropMetadata> = {
      name: propName || propertyKey,
      props: props || {},
    };
    propMetadata(getUIAttributeKey(propertyKey, UIKeys.UILISTPROP), metadata)(
      target,
      propertyKey
    );
  };
}

/**
 * @description Decorator that positions a property in a specific grid layout position
 * @summary Specifies the column and row position for a property in a UI layout grid
 * This decorator allows you to define the specific position of a property within
 * a grid-based layout system. It specifies which column and row the property
 * should occupy when rendered in the UI.
 *
 * @param {number} col The column position in the grid layout
 * @param {number} [row=1] The row position in the grid layout (defaults to 1)
 * @param {Record<string, any>} [props={}] Additional properties to pass to the layout item
 * @return {Function} A property decorator function
 *
 * @function uilayoutprop
 * @category Property Decorators
 *
 * @example
 * // Position properties in a grid layout
 * @uilayout('user-form', 2, 3) // 2 columns, 3 rows
 * @model()
 * class UserForm {
 *   @attribute()
 *   @uilayoutprop(1, 1) // One column, first row
 *   firstName: string;
 *
 *   @attribute()
 *   @uilayoutprop(2, 1) // One column, first row
 *   lastName: string;
 *
 *   @attribute()
 *   @uilayoutprop(1, 2) // One column, second row
 *   email: string;
 *
 *   @attribute()
 *   @uilayoutprop(2, 3) // All columns, third row
 *   bio: string;
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uilayoutprop
 *   participant RenderingEngine
 *   participant LayoutContainer
 *   Model->>uilayoutprop: Apply to property
 *   uilayoutprop->>Model: Add layout item metadata
 *   RenderingEngine->>Model: Get layout item metadata
 *   Model->>RenderingEngine: Return column, row, and props
 *   RenderingEngine->>LayoutContainer: Position element at grid coordinates
 *   LayoutContainer->>RenderingEngine: Return positioned element
 */
export function uilayoutprop(col: UILayoutCol = 1, row: number = 1) {
  return (target: any, propertyKey?: any) => {
    const metadata: UILayoutPropMetadata = {
      name: propertyKey,
      // col,
      // row,
      props: Object.assign({}, { row, col }),
    };
    propMetadata(getUIAttributeKey(propertyKey, UIKeys.UILAYOUTPROP), metadata)(
      target,
      propertyKey
    );
  };
}

/**
 * @description Decorator that assigns a property to a specific page in multi-page forms
 * @summary Specifies which page a property should appear on in paginated UI layouts
 * This decorator applies metadata to the property, indicating which page number it belongs to
 * in a multi-page form or wizard. Properties with the same page number are grouped together
 * and rendered on the same page. This is typically used in conjunction with @uisteppedmodel to
 * organize large forms into manageable sections.
 *
 * @param {number} [page=1] The page number where the property should appear (default is 1)
 * @return {Function} A property decorator function
 *
 * @function uipageprop
 * @category Property Decorators
 *
 * @example
 * // Create a multi-step registration form with page-based layout
 * @uisteppedmodel('registration-form', 2, true)
 * @model()
 * class RegistrationForm {
 *   // Page 1: Personal Information
 *   @attribute()
 *   @uipageprop(1)
 *   firstName: string;
 *
 *   @attribute()
 *   @uipageprop(1)
 *   lastName: string;
 *
 *   @attribute()
 *   @uipageprop(1)
 *   dateOfBirth: Date;
 *
 *   // Page 2: Contact Information
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
 * @mermaid
 * sequenceDiagram
 *   participant Model
 *   participant uipageprop
 *   participant RenderingEngine
 *   participant PaginationController
 *   participant UI
 *   Model->>uipageprop: Apply to property
 *   uipageprop->>Model: Add page metadata
 *   RenderingEngine->>Model: Get page metadata
 *   Model->>RenderingEngine: Return page number
 *   RenderingEngine->>PaginationController: Group properties by page
 *   PaginationController->>UI: Render current page properties
 */
export function uipageprop(page: number = 1) {
  return function uipageprop(original: any, propertyKey?: any) {
    return propMetadata(getUIAttributeKey(propertyKey, UIKeys.PAGE), page)(
      original,
      propertyKey
    );
  };
}
