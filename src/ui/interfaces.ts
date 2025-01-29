import { FieldProperties } from "./types";
import { CrudOperations } from "@decaf-ts/db-decorators";

export interface CrudFormField<T = void> {
  operation: CrudOperations;
  props: FieldProperties & T;
  value: string;
}
