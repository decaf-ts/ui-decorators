import { ModelKeys, ValidationKeys } from "@decaf-ts/decorator-validation";

/**
 * @enum UIKeys
 * @category Constants
 */
export const UIKeys = {
  REFLECT: `${ModelKeys.REFLECT}.ui.`,
  UIMODEL: "uimodel",
  RENDERED_BY: "rendered-by",
  ELEMENT: "element",
  PROP: "prop",
  NAME: "name",
  NAME_PREFIX: "input-",
  CUSTOM_PROPS: "customValidationProps",

  TYPE: "type",
  SUB_TYPE: "subtype",

  READ_ONLY: "readonly",
  REQUIRED: ValidationKeys.REQUIRED,
  MIN: ValidationKeys.MIN,
  MIN_LENGTH: ValidationKeys.MIN_LENGTH,
  MAX: ValidationKeys.MAX,
  MAX_LENGTH: ValidationKeys.MAX_LENGTH,
  PATTERN: ValidationKeys.PATTERN,
  URL: ValidationKeys.URL,
  STEP: ValidationKeys.STEP,
  DATE: ValidationKeys.DATE,
  EMAIL: ValidationKeys.EMAIL,
  PASSWORD: ValidationKeys.PASSWORD,
};
