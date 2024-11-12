import { ValidationKeys } from "@decaf-ts/decorator-validation";

export interface FieldDefinition {
  tag: string;
  props: FieldProperties;
  children?: FieldDefinition[];
}

export interface FieldProperties {
  [k: string]: unknown;
  type: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number | Date;
  min?: number | Date;
  pattern?: string;
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
