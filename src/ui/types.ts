import { OperationKeys } from "@decaf-ts/db-decorators";
import { UIKeys } from "./constants";

export interface FieldDefinition<T = void> {
  tag: string;
  rendererId?: string;
  props: T & FieldProperties;
  children?: FieldDefinition<T>[];
  item?: UIListItemElementMetadata;
}

export interface FieldProperties {
  name: string;
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
 * @memberOf ui-decorators.ui.decorators
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
 * @memberOf ui-decorators.ui.decorators
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
 * @memberOf ui-decorators.ui.decorators
 */
export type UIListPropMetadata = {
  name: string;
  props: Record<string, any>;
};

/**
 * @typedef UIListItemModelMetadata
 * @memberOf ui-decorators.ui.decorators
 */
export type UIListItemModelMetadata = {
  item: UIListItemElementMetadata;
};

/**
 * @typedef UIListItemElementMetada
 * @memberOf ui-decorators.ui.decorators
 */
export type UIListItemElementMetadata = {
  tag: string;
  props?: Record<string, any>;
  mapper?: Record<string, string>;
}