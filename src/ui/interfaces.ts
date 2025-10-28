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



/**
 * @description Interface for defining a page/step in a multi-step form or wizard
 * @summary Provides metadata for individual pages in stepped model forms
 * This interface represents a single page or step in a multi-step form workflow.
 * It allows defining optional title and description metadata for each page,
 * which can be used to display step indicators, progress bars, or navigation labels.
 * Used in conjunction with the @uisteppedmodel decorator.
 *
 * @interface ISteppedModelPage
 * @memberOf module:ui-decorators
 *
 * @property {string} [title] - Optional title for the page/step (e.g., "Personal Information")
 * @property {string} [description] - Optional description providing additional context for the page
 *
 * @example
 * // Define pages for a multi-step wizard
 * const wizardPages: ISteppedModelPage[] = [
 *   { title: 'Personal Info', description: 'Enter your basic details' },
 *   { title: 'Contact', description: 'Provide your contact information' },
 *   { title: 'Review', description: 'Review and confirm your information' }
 * ];
 *
 * @uisteppedmodel('div', wizardPages, true)
 * class RegistrationWizard extends Model {
 *   // Properties with @uipageprop decorators
 * }
 */
export interface ISteppedModelPage {
  title?: string;
  description?: string;
}
