import {
  Constructor,
  DateValidator,
  DiffValidator,
  EmailValidator,
  EqualsValidator,
  GreaterThanOrEqualValidator,
  GreaterThanValidator,
  LessThanOrEqualValidator,
  LessThanValidator,
  MaxLengthValidator,
  MaxValidator,
  MinLengthValidator,
  MinValidator,
  ModelKeys,
  PasswordValidator,
  PatternValidator,
  RequiredValidator,
  StepValidator,
  URLValidator,
  ValidationKeys,
  Validator,
} from "@decaf-ts/decorator-validation";

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

  UILISTITEM: "uilistitem",
  UILISTPROP: "listprop",

  TYPE: "type",
  SUB_TYPE: "subtype",

  HIDDEN: "hidden",
  FORMAT: "format",

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
  EQUALS: ValidationKeys.EQUALS,
  DIFF: ValidationKeys.DIFF,
  LESS_THAN: ValidationKeys.LESS_THAN,
  LESS_THAN_OR_EQUAL: ValidationKeys.LESS_THAN_OR_EQUAL,
  GREATER_THAN: ValidationKeys.GREATER_THAN,
  GREATER_THAN_OR_EQUAL: ValidationKeys.GREATER_THAN_OR_EQUAL,
};

export const ValidatableByType: Record<string, Constructor<Validator>> = {
  [UIKeys.EMAIL]: EmailValidator,
  [UIKeys.URL]: URLValidator,
  [UIKeys.DATE]: DateValidator,
  [UIKeys.PASSWORD]: PasswordValidator,
};

/**
 * @constant ValidatableByAttribute
 *
 * @memberOf ui-decorators-web.ui
 */
export const ValidatableByAttribute: Record<string, Constructor<Validator>> = {
  [UIKeys.REQUIRED]: RequiredValidator,
  [UIKeys.MIN]: MinValidator,
  [UIKeys.MAX]: MaxValidator,
  [UIKeys.STEP]: StepValidator,
  [UIKeys.MIN_LENGTH]: MinLengthValidator,
  [UIKeys.MAX_LENGTH]: MaxLengthValidator,
  [UIKeys.PATTERN]: PatternValidator,
  [UIKeys.EQUALS]: EqualsValidator,
  [UIKeys.DIFF]: DiffValidator,
  [UIKeys.LESS_THAN]: LessThanValidator,
  [UIKeys.LESS_THAN_OR_EQUAL]: LessThanOrEqualValidator,
  [UIKeys.GREATER_THAN]: GreaterThanValidator,
  [UIKeys.GREATER_THAN_OR_EQUAL]: GreaterThanOrEqualValidator,
};

export const HTML5DateFormat = "yyyy-MM-dd";

export const HTML5InputTypes = {
  BUTTON: "button",
  CHECKBOX: "checkbox",
  COLOR: "color",
  DATE: UIKeys.DATE,
  DATETIME_LOCAL: "datetime-local",
  EMAIL: UIKeys.EMAIL,
  FILE: "file",
  HIDDEN: "hidden",
  IMAGE: "image",
  MONTH: "month",
  NUMBER: "number",
  PASSWORD: UIKeys.PASSWORD,
  RADIO: "radio",
  RANGE: "range",
  RESET: "reset",
  SEARCH: "search",
  SUBMIT: "submit",
  TEL: "tel",
  TEXT: "text",
  TIME: "time",
  URL: UIKeys.URL,
  WEEK: "week",
};

export const HTML5CheckTypes = [
  HTML5InputTypes.CHECKBOX,
  HTML5InputTypes.RADIO,
];
