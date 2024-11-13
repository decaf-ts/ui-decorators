import {
  date,
  maxlength,
  minlength,
  Model,
  model,
  ModelArg,
  required,
} from "@decaf-ts/decorator-validation";
import { uielement, uimodel } from "../../src";
import { id } from "@decaf-ts/db-decorators";

@model()
@uimodel()
export class TestClass extends Model {
  @required()
  @minlength(5)
  @maxlength(15)
  @uielement("input-element", { subtype: "OtherTest" })
  name!: string;

  constructor(model?: ModelArg<TestClass>) {
    super(model);
  }
}

@uimodel()
@model()
export class DemoModel extends Model {
  @id()
  @uielement("ngx-crud-form-field")
  id!: number;

  @required()
  @minlength(5)
  @uielement("ngx-crud-form-field")
  name!: string;

  @date("yyyy/MM/dd")
  @required()
  @uielement("ngx-crud-form-field")
  birthdate!: Date;

  constructor(arg?: ModelArg<DemoModel>) {
    super(arg);
  }
}
