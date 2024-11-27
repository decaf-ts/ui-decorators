import {
  Constructor,
  DateValidator,
  EmailValidator,
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

  TYPE: "type",
  SUB_TYPE: "subtype",

  HIDDEN: "hidden",

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

export const ValidatableByType: Record<string, Constructor<Validator>> = [
  { validationKey: UIKeys.EMAIL, validator: EmailValidator },
  { validationKey: UIKeys.URL, validator: URLValidator },
  { validationKey: UIKeys.DATE, validator: DateValidator },
  { validationKey: UIKeys.PASSWORD, validator: PasswordValidator },
].reduce((accum: Record<string, Constructor<Validator>>, vd) => {
  accum[vd.validationKey] = vd.validator;
  return accum;
}, {});

/**
 * @constant ValidatableByAttribute
 *
 * @memberOf ui-decorators-web.ui
 */
export const ValidatableByAttribute: Record<string, Constructor<Validator>> = [
  { validationKey: UIKeys.REQUIRED, validator: RequiredValidator },
  { validationKey: UIKeys.MIN, validator: MinValidator },
  { validationKey: UIKeys.MAX, validator: MaxValidator },
  { validationKey: UIKeys.STEP, validator: StepValidator },
  { validationKey: UIKeys.MIN_LENGTH, validator: MinLengthValidator },
  { validationKey: UIKeys.MAX_LENGTH, validator: MaxLengthValidator },
  { validationKey: UIKeys.PATTERN, validator: PatternValidator },
].reduce((accum: Record<string, Constructor<Validator>>, vd) => {
  accum[vd.validationKey] = vd.validator;
  return accum;
}, {});

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
