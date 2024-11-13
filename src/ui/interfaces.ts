import { FieldProperties } from "./types";
import { OperationKeys } from "@decaf-ts/db-decorators";

export interface CrudFormField<T = void> {
  operation:
    | OperationKeys.CREATE
    | OperationKeys.READ
    | OperationKeys.UPDATE
    | OperationKeys.DELETE;
  props: FieldProperties & T;
  value: string;
}
