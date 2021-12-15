/**
 * @interface UIInputProps
 *
 * @memberOf ui-decorators.ui
 */
export interface UIInputProps {
    id?: string;

    name: string;
    value?: string;

    type?: string;

    /**
     * To enable custom validators
     */
    subtype?: string;


    placeholder?: string;
    disabled?: boolean;

    /**
     * HTML5 validation Attributes
     */
    required?: boolean | "true" | "false";
    minlength?: string | number;
    maxlength?: string | number;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
}

export interface ValidityState {

}
/**
 * @interface UIInputElement
 *
 * @memberOf ui-decorators.ui
 */
export interface UIInputElement extends UIInputProps {
    [indexer: string]: any

    /**
     * HTML5 mapped onchange event
     *
     * @event onInputChange
     */
    onInputChange?: any;
    /**
     * HTML5 mapped onchange event
     *
     * @event onInputInput
     */
    onInputInput?: any;
    /**
     * HTML5 mapped oninvalid event
     *
     * @event onInputInvalid
     */
    onInputInvalid?: any;
    /**
     * HTML5 mapped oncut event
     *
     * @event onInputCut
     */
    onInputCut?: any;
    /**
     * HTML5 mapped oncopy event
     *
     * @event onInputCopy
     */
    onInputCopy?: any;
    /**
     * HTML5 mapped onpaste event
     *
     * @event onInputPaste
     */
    onInputPaste?: any;


    /**
     * HTML5 validation props
     */
    readonly validity?: ValidityState;
    readonly validationMessage?: string;

    /**
     * HTML5 validation methods
     */
    checkValidity(): any;
    reportValidity(): any;
    setCustomValidity(errors: string): void;
}
/**
 * @typedef InputDefinition
 * @memberOf ui-decorators.ui
 */
export type InputDefinition = {
    element?: string,
    label?: string,
    props: UIInputProps,
    validation?: {
        [indexer: string]: ValidatorDefinition,
    }
}
/**
 * @typedef ValidatorDefinition
 * @memberOf ui-decorators.ui
 */
export type ValidatorDefinition = {
    args?: any[],
    message: string
}

/**
 * @typedef FormDefinition
 * @memberOf ui-decorators.ui
 */
export type FormDefinition = {
    prefix?: string,
    fields: InputDefinition[]
}
