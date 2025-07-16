/**
 * @description Type definitions for UI components and rendering
 * @summary Defines types and interfaces used throughout the UI decorators library
 * This module contains type definitions for field properties, UI metadata,
 * and other structures used in rendering UI components.
 * @module ui/types
 * @memberOf module:ui-decorators
 */

import { OperationKeys } from "@decaf-ts/db-decorators";
import { UIKeys } from "./constants";

/**
 * @description Interface for defining a UI field or component
 * @summary Represents a renderable UI element with properties and children
 * This interface defines the structure of a UI field or component, including
 * its tag name, properties, and optional children elements.
 *
 * @interface FieldDefinition
 * @template T Additional properties type (defaults to void)
 * @memberOf module:ui-decorators
 *
 * @property {string} tag - The HTML element or component tag name
 * @property {string} [rendererId] - Optional ID of the renderer to use
 * @property props - Combined properties for the field
 * @property {FieldDefinition[]} [children] - Optional child elements
 * @property {UIListItemElementMetadata} [item] - Optional list item metadata
 */
export interface FieldDefinition<T = void> {
  tag: string;
  rendererId?: string;
  props: T & FieldProperties;
  children?: FieldDefinition<T>[];
  item?: UIListItemElementMetadata;
}

/**
 * @description Interface for field properties including validation
 * @summary Defines common properties and validation rules for UI fields
 * This interface defines the standard properties that can be applied to
 * UI fields, including basic attributes and validation rules.
 *
 * @interface FieldProperties
 * @memberOf module:ui-decorators
 *
 * @property {string} name - The name of the field
 * @property {string} path - The full hierarchical path of the field
 * @property {string} childOf - The parent path of the immediate parent field, if nested
 * @property {string} type - The type of the field (e.g., 'text', 'number')
 * @property {string|number|Date} value - The current value of the field
 * @property {boolean} [hidden] - Whether the field is hidden
 * @property {boolean} [disabled] - Whether the field is disabled
 * @property {boolean} [required] - Whether the field is required
 * @property {boolean} [readonly] - Whether the field is read-only
 * @property {number} [maxLength] - Maximum length for text fields
 * @property {number} [minLength] - Minimum length for text fields
 * @property {number|Date} [max] - Maximum value for numeric or date fields
 * @property {number|Date} [min] - Minimum value for numeric or date fields
 * @property {string} [pattern] - Regex pattern for validation
 * @property {number} [step] - Step value for numeric fields
 * @property {string} [format] - Format string for date fields
 * @property {string} [equals] - Field must equal the value of this field
 * @property {string} [diff] - Field must differ from the value of this field
 * @property {string} [lessThan] - Field must be less than this field
 * @property {string} [lessThanOrEqual] - Field must be less than or equal to this field
 * @property {string} [greaterThan] - Field must be greater than this field
 * @property {string} [greaterThanOrEqual] - Field must be greater than or equal to this field
 */
export interface FieldProperties {
  name: string;
  path: string;
  childOf?: string;
  type: string;
  value: string | number | Date;
  hidden?: boolean;
  disabled?: boolean;
  // Validation
  required?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number | Date;
  min?: number | Date;
  pattern?: string;
  step?: number;
  format?: string;
  [UIKeys.EQUALS]?: string;
  [UIKeys.DIFF]?: string;
  [UIKeys.LESS_THAN]?: string;
  [UIKeys.LESS_THAN_OR_EQUAL]?: string;
  [UIKeys.GREATER_THAN]?: string;
  [UIKeys.GREATER_THAN_OR_EQUAL]?: string;
}

/**
 * @typedef UIElementMetadata
 * @memberOf module:ui-decorators
 */
export type UIElementMetadata = {
  tag: string;
  props?: Record<string, any>;
  serialize?: boolean;
};

/**
 * @typedef UIElementMetadata
 * @memberOf ui-decorators.ui.decorators
 */
export type UIModelMetadata = Omit<UIElementMetadata, "serialize">;

/**
 * @typedef UIPropMetadata
 * @memberOf module:ui-decorators
 */
export type UIPropMetadata = {
  name: string;
  stringify: boolean;
};

export type CrudOperationKeys =
  | OperationKeys.CREATE
  | OperationKeys.READ
  | OperationKeys.UPDATE
  | OperationKeys.DELETE;

/**
 * @typedef UIListPropMetadata
 * @memberOf module:ui-decorators
 */
export type UIListPropMetadata = {
  name: string;
  props: Record<string, any>;
};

/**
 * @typedef UIListItemModelMetadata
 * @memberOf module:ui-decorators
 */
export type UIListItemModelMetadata = {
  item: UIListItemElementMetadata;
};

/**
 * @typedef UIListItemElementMetada
 * @memberOf module:ui-decorators
 */
export type UIListItemElementMetadata = {
  tag: string;
  props?: Record<string, any>;
  mapper?: Record<string, string>;
};
