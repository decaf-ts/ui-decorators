/**
 * @description Interfaces for UI form components
 * @summary Defines interfaces for form fields with CRUD operations
 * This module contains interfaces that extend basic field properties with
 * CRUD operation information for form generation.
 * @module ui/interfaces
 * @memberOf module:ui-decorators
 */

import { FieldProperties } from "./types";
import { CrudOperations } from "@decaf-ts/db-decorators";

/**
 * @description Form field interface with CRUD operation information
 * @summary Extends basic field properties with a specific CRUD operation
 * This interface represents a form field that is associated with a specific
 * CRUD operation (Create, Read, Update, Delete). It combines all the standard
 * field properties with an operation property.
 *
 * @interface CrudFormField
 * @extends FieldProperties
 * @memberOf module:ui-decorators
 *
 * @property {CrudOperations} operation - The CRUD operation associated with this field
 */
export interface CrudFormField extends FieldProperties {
  /**
   * @description The CRUD operation associated with this field
   * @summary Specifies which operation (Create, Read, Update, Delete) this field is for
   */
  operation: CrudOperations;
}
