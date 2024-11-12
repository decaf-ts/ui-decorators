export interface FieldDefinition {
  tag: string;
  props?: Record<string, unknown>;
  children?: FieldDefinition[];
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

export type UIPropMetadata = {
  attr?: string;
  serialize?: boolean;
};

export type UIModelMetadata = Omit<UIElementMetadata, "serialize">;
