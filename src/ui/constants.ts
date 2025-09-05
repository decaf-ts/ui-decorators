/**
 * @description Constants and enums for UI rendering and validation
 * @summary Defines keys, mappings, and HTML5 input types for UI components
 * This module provides constants used throughout the UI decorators library for
 * rendering, validation, and HTML element generation.
 * @module ui/constants
 * @memberOf module:ui-decorators
 */

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
 * @description Key constants used for UI metadata and rendering
 * @summary Collection of string constants used as keys for UI-related metadata
 * These keys are used throughout the library to store and retrieve metadata related to
 * UI models, elements, properties, and validation rules.
 *
 * @typedef {Object} UIKeysType
 * @property {string} REFLECT - Base reflection key for UI metadata
 * @property {string} UIMODEL - Key for UI model metadata
 * @property {string} RENDERED_BY - Key for specifying rendering engine
 * @property {string} ELEMENT - Key for element metadata
 * @property {string} PROP - Key for property metadata
 * @property {string} NAME - Key for name attribute
 * @property {string} NAME_PREFIX - Prefix for input names
 * @property {string} CUSTOM_PROPS - Key for custom validation properties
 * @property {string} UILISTITEM - Key for list item metadata
 * @property {string} UILISTPROP - Key for list property metadata
 * @property {string} TYPE - Key for type metadata
 * @property {string} SUB_TYPE - Key for subtype metadata
 * @property {string} HIDDEN - Key for hidden attribute
 * @property {string} FORMAT - Key for format metadata
 * @property {string} READ_ONLY - Key for readonly attribute
 * @property {string} REQUIRED - Key for required validation
 * @property {string} MIN - Key for minimum value validation
 * @property {string} MIN_LENGTH - Key for minimum length validation
 * @property {string} MAX - Key for maximum value validation
 * @property {string} MAX_LENGTH - Key for maximum length validation
 * @property {string} PATTERN - Key for pattern validation
 * @property {string} URL - Key for URL validation
 * @property {string} STEP - Key for step validation
 * @property {string} DATE - Key for date validation
 * @property {string} EMAIL - Key for email validation
 * @property {string} PASSWORD - Key for password validation
 * @property {string} EQUALS - Key for equality validation
 * @property {string} DIFF - Key for difference validation
 * @property {string} LESS_THAN - Key for less than validation
 * @property {string} LESS_THAN_OR_EQUAL - Key for less than or equal validation
 * @property {string} GREATER_THAN - Key for greater than validation
 * @property {string} GREATER_THAN_OR_EQUAL - Key for greater than or equal validation
 *
 * @const UIKeys
 * @type {UIKeysType}
 * @readonly
 * @memberOf module:ui-decorators
 */
export const UIKeys = {
  REFLECT: `${ModelKeys.REFLECT}.ui.`,
  UIMODEL: "uimodel",
  RENDERED_BY: "rendered-by",
  ELEMENT: "element",
  PROP: "prop",
  CHILD: "child",
  NAME: "name",
  NAME_PREFIX: "input-",
  CUSTOM_PROPS: "customValidationProps",

  UILISTITEM: "uilistitem",
  UILISTPROP: "listprop",
  UILAYOUT: "uilayout",
  UILAYOUTITEM: "uilayoutitem",
  HANDLERS: "handlers",

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

/**
 * @description Mapping of input types to their corresponding validators
 * @summary Maps special input types to their validator classes
 * This constant maps input types like email, URL, date, and password to their
 * corresponding validator classes from the decorator-validation library.
 *
 * @typedef {Object.<string, Constructor<Validator>>} ValidatableByTypeMap
 * @property {Constructor<EmailValidator>} email - Validator for email inputs
 * @property {Constructor<URLValidator>} url - Validator for URL inputs
 * @property {Constructor<DateValidator>} date - Validator for date inputs
 * @property {Constructor<PasswordValidator>} password - Validator for password inputs
 *
 * @const ValidatableByType
 * @type {ValidatableByTypeMap}
 * @readonly
 * @memberOf module:ui-decorators
 */
export const ValidatableByType: Record<string, Constructor<Validator>> = {
  [UIKeys.EMAIL]: EmailValidator,
  [UIKeys.URL]: URLValidator,
  [UIKeys.DATE]: DateValidator,
  [UIKeys.PASSWORD]: PasswordValidator,
};

/**
 * @description Mapping of validation attributes to their corresponding validators
 * @summary Maps HTML validation attributes to their validator classes
 * This constant maps HTML validation attributes like required, min, max, pattern, etc.
 * to their corresponding validator classes from the decorator-validation library.
 *
 * @typedef {Object.<string, Constructor<Validator>>} ValidatableByAttributeMap
 * @property {Constructor<RequiredValidator>} required - Validator for required fields
 * @property {Constructor<MinValidator>} min - Validator for minimum value
 * @property {Constructor<MaxValidator>} max - Validator for maximum value
 * @property {Constructor<StepValidator>} step - Validator for step value
 * @property {Constructor<MinLengthValidator>} minlength - Validator for minimum length
 * @property {Constructor<MaxLengthValidator>} maxlength - Validator for maximum length
 * @property {Constructor<PatternValidator>} pattern - Validator for regex pattern
 * @property {Constructor<EqualsValidator>} equals - Validator for equality
 * @property {Constructor<DiffValidator>} diff - Validator for difference
 * @property {Constructor<LessThanValidator>} lessthan - Validator for less than comparison
 * @property {Constructor<LessThanOrEqualValidator>} lessthanorequal - Validator for less than or equal comparison
 * @property {Constructor<GreaterThanValidator>} greaterthan - Validator for greater than comparison
 * @property {Constructor<GreaterThanOrEqualValidator>} greaterthanorequal - Validator for greater than or equal comparison
 *
 * @const ValidatableByAttribute
 * @type {ValidatableByAttributeMap}
 * @readonly
 * @memberOf module:ui-decorators
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

/**
 * @description Standard date format string for HTML5 date inputs
 * @summary Format string for HTML5 date inputs (yyyy-MM-dd)
 * This constant defines the standard date format string used for HTML5 date inputs.
 *
 * @const HTML5DateFormat
 * @type {string}
 * @readonly
 * @memberOf module:ui-decorators
 */
export const HTML5DateFormat = "yyyy-MM-dd";

/**
 * @description Collection of HTML5 input type values
 * @summary Maps input type constants to their HTML attribute values
 * This constant provides a mapping of input type constants to their corresponding
 * HTML attribute values for use in form elements.
 *
 * @typedef {Object} HTML5InputTypesMap
 * @property {string} BUTTON - Button input type
 * @property {string} CHECKBOX - Checkbox input type
 * @property {string} COLOR - Color picker input type
 * @property {string} DATE - Date picker input type
 * @property {string} DATETIME_LOCAL - Local datetime picker input type
 * @property {string} EMAIL - Email input type with validation
 * @property {string} FILE - File upload input type
 * @property {string} HIDDEN - Hidden input type
 * @property {string} IMAGE - Image input type
 * @property {string} MONTH - Month picker input type
 * @property {string} NUMBER - Numeric input type
 * @property {string} PASSWORD - Password input type with masked text
 * @property {string} RADIO - Radio button input type
 * @property {string} RANGE - Range slider input type
 * @property {string} RESET - Form reset button input type
 * @property {string} SEARCH - Search input type
 * @property {string} SUBMIT - Form submit button input type
 * @property {string} TEL - Telephone number input type
 * @property {string} TEXT - Basic text input type
 * @property {string} TIME - Time picker input type
 * @property {string} URL - URL input type with validation
 * @property {string} WEEK - Week picker input type
 *
 * @const HTML5InputTypes
 * @type {HTML5InputTypesMap}
 * @readonly
 * @memberOf module:ui-decorators
 */
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
  TEXTAREA: 'textarea',
  TIME: "time",
  URL: UIKeys.URL,
  WEEK: "week",
};

/**
 * @description Array of HTML5 input types that use checkboxes
 * @summary List of input types that represent checkable controls
 * This constant defines an array of HTML5 input types that represent
 * checkable controls (checkbox and radio).
 *
 * @const HTML5CheckTypes
 * @type {string[]}
 * @readonly
 * @memberOf module:ui-decorators
 */
export const HTML5CheckTypes = [
  HTML5InputTypes.CHECKBOX,
  HTML5InputTypes.RADIO,
];
