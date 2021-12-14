import {ValidationKeys} from '@tvenceslau/decorator-validation/lib';
import RequiredValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/RequiredValidator';
import EmailValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/EmailValidator';
import MaxValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/MaxValidator';
import MaxLengthValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/MaxLengthValidator';
import MinValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/MinValidator';
import MinLengthValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/MinLengthValidator';
import URLValidator from "@tvenceslau/decorator-validation/lib/validation/Validators/URLValidator";
import PatternValidator from "@tvenceslau/decorator-validation/lib/validation/Validators/PatternValidator";
import Validator from "@tvenceslau/decorator-validation/lib/validation/Validators/Validator";
import StepValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/StepValidator';
import DateValidator from '@tvenceslau/decorator-validation/lib/validation/Validators/DateValidator';

/**
 * @namespace ui.constants
 * @memberOf ui
 */


export type ValidityStateMatcherType = {"tooShort": string, "typeMismatch": string, "stepMismatch": string, "rangeOverflow": string, /*badInput: undefined, customError: undefined,*/ "tooLong": string, "patternMismatch": string, "rangeUnderflow": string, "valueMissing": string}

/**
 * Does the match between the HTML5's ValidityState and the validators and input element type
 * @subcategory UI
 */
export const ValidityStateMatcher: ValidityStateMatcherType = {
    "patternMismatch": "pattern",
    "rangeOverflow": "max",
    "rangeUnderflow": "min",
    "stepMismatch": "step",
    "tooLong": "maxLength",
    "tooShort": "minLength",
    "typeMismatch": "email|URL",
    "valueMissing": "required"
}

export const CSS_SELECTORS: {[indexer: string]: string} = {
    NAMED_SLOT: 'div[slot={0}], slot-fb[name="{0}"]',
    NAMED_DIV: 'div[name={0}]',
    NAMED_ANY: '*[name={0}]'
}

/**
 * @enum
 * @subcategory UI
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

export const ValidatableByType: {[indexer: string] : {new(): Validator}} = [
    {validationKey: UIKeys.EMAIL, validator: EmailValidator},
    {validationKey: UIKeys.URL, validator: URLValidator},
    {validationKey: UIKeys.DATE, validator: DateValidator}
].reduce((accum, vd) => {
    // @ts-ignore
    accum[vd.validationKey] = vd.validator
    return accum;
}, {});

export const ValidatableByAttribute: {[indexer: string] : {new(): Validator}} = [
    {validationKey: UIKeys.REQUIRED, validator: RequiredValidator},
    {validationKey: UIKeys.MIN, validator: MinValidator},
    {validationKey: UIKeys.MAX, validator: MaxValidator},
    {validationKey: UIKeys.STEP, validator: StepValidator},
    {validationKey: ValidityStateMatcher.tooShort.toLowerCase(), validator: MinLengthValidator},
    {validationKey: ValidityStateMatcher.tooLong.toLowerCase(), validator: MaxLengthValidator},
    {validationKey: UIKeys.PATTERN, validator: PatternValidator},
].reduce((accum, vd) => {
    // @ts-ignore
    accum[vd.validationKey] = vd.validator
    return accum;
}, {});

export const HTML5DateFormat = 'yyyy-MM-dd';

export const HTML5InputTypes = {
    TEXT: 'text',
    NUMBER: 'number',
    DATE: ValidationKeys.DATE,
    EMAIL: ValidationKeys.EMAIL,
    URL: ValidationKeys.URL
}


/**
 * @enum RenderModes
 * @subcategory UI
 */
export const RenderModes = {
    CREATE: 'create',
    VIEW: 'view'
}
