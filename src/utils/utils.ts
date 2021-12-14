import 'reflect-metadata';
import {getValidatorRegistry, ValidatorDefinition} from '@tvenceslau/decorator-validation/lib/validation';
import Validator from '@tvenceslau/decorator-validation/lib/validation/Validators/Validator';
export {getPropertyDecorators, formatDate, stringFormat} from '@tvenceslau/decorator-validation/lib/utils';
import Model from '@tvenceslau/decorator-validation/lib/Model/Model';
import {construct as superConstruct, ModelKeys} from '@tvenceslau/decorator-validation/lib';
import {UIModel} from "../model/types";
import {FormDefinition, UIInputElement, UIKeys, ValidatableByAttribute, ValidatableByType} from "../ui";
import {ValidatorRegistry} from "@tvenceslau/decorator-validation/lib/validation/ValidatorRegistry";


export function clearHtmlInput(el: UIInputElement){
  el.value = '';
}

/**
 * Gets the validator definition from a UInput element
 * @param {UIInputElement} input
 * @return {ValidatorDefinition[]} a list with all the {@link ValidatorDefinition}s for all properties of the element
 */
function getValidatorDefinition(input: UIInputElement) : ValidatorDefinition[]{
  const genValidatorDefinition = function(key: string, validator: {new(): Validator}) : ValidatorDefinition{
    return {
      validationKey: key,
      validator: validator
    }
  }

  const result: ValidatorDefinition[] = [];
  const fieldType = input[UIKeys.TYPE];
  if (fieldType in ValidatableByType)
    result.push(genValidatorDefinition(fieldType, ValidatableByType[fieldType]));

  for (let key in ValidatableByAttribute){
    const propValue = input[key];
    if (propValue !== undefined && propValue !== "")
      result.push(genValidatorDefinition(key, ValidatableByAttribute[key]));
  }

  return result;
}

/**
 * Registers the needed validators from an UInputElement in the Validator Registry
 * @param element
 */
export function registerInputValidators(element: UIInputElement): void{
  getValidatorRegistry().register(...getValidatorDefinition(element));
}


export function getInputValidators(element: UIInputElement){
  return getValidatorDefinition(element).reduce((accum: {[indexer: string]: Validator | undefined}, vd) => {
    accum[vd.validationKey] = getValidatorRegistry().get(vd.validationKey);
    return accum;
  }, {});
}

/**
 * Util function to retrieve the decorators for the provided Property
 *
 * @function getPropertyDecorators
 * @memberOf utils
 */
export function getClassDecorators(annotationPrefix: string, target: any): {key: string, props: any}[] {

  const keys: any[] = Reflect.getOwnMetadataKeys(target.constructor);

  return keys.filter(key => key.toString().startsWith(annotationPrefix))
    .reduce((values, key) => {
      // get metadata value
      const currValues = {
        key: key.substring(annotationPrefix.length),
        props: Reflect.getMetadata(key, target.constructor)
      };
      return values.concat(currValues);
    }, []);
}

export function modelToFormDefinition(model: UIModel, prefix: string = UIKeys.NAME_PREFIX): FormDefinition {
  return {
    prefix: prefix,
    fields: [

    ]
  }
}


