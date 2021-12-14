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

export interface UIInputElement extends UIInputProps {
    [indexer: string]: any

    /**
     * HTML5 input events
     */
    onchange?: any;
    oninput?: any;
    oninvalid?: any;

    // oncut;
    // oncopy;
    // onpaste;


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

export type InputDefinition = {
    element?: string,
    label?: string,
    props: UIInputProps,
    validation?: {
        [indexer: string]: ValidatorDefinition,
    }
}

export type ValidatorDefinition = {
    args?: [],
    message: string
}

export type FormDefinition = {
    prefix?: string,
    fields: InputDefinition[]
}

export type UIPropertyDecoratorDefinition = {
    prop: string | symbol,
    decorators: UIDecoratorDefinition[]
}

export type UIDecoratorDefinition = {
    key: string,
    props: UIElementDefinition
}

export type UIElementDefinition = {
    tag: string,
    props: {[indexer: string]: string,}
    valueAttribute?: string
    ,
}
