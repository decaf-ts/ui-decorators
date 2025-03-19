import { FieldProperties } from "./types";
import { CrudOperations } from "@decaf-ts/db-decorators";

export interface CrudFormField extends FieldProperties {
  operation: CrudOperations;
}
