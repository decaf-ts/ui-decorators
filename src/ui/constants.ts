import {ValidationKeys} from "@tvenceslau/decorator-validation/lib";

/**
 * @enum UIKeys
 * @category Constants
 */
export const UIKeys = {
    REFLECT: 'model.ui.',
    ELEMENT: 'element',
    NAME: 'name',
    NAME_PREFIX: 'input-',

    TYPE: 'type',
    SUB_TYPE: 'subtype',

    REQUIRED: ValidationKeys.REQUIRED,
    MIN: ValidationKeys.MIN,
    MIN_LENGTH: ValidationKeys.MIN_LENGTH,
    MAX: ValidationKeys.MAX,
    MAX_LENGTH: ValidationKeys.MAX_LENGTH,
    PATTERN: ValidationKeys.PATTERN,
    URL: ValidationKeys.URL,
    STEP: ValidationKeys.STEP,
    DATE: ValidationKeys.DATE,
    EMAIL: ValidationKeys.EMAIL
}