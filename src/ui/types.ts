import { OperationKeys } from "@decaf-ts/db-decorators";

export interface FieldDefinition<T = void> {
  tag: string;
  props: T & FieldProperties;
  children?: FieldDefinition<T>[];
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
