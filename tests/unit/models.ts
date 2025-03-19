import {
  date,
  email,
  maxlength,
  minlength,
  Model,
  model,
  ModelArg,
  password,
  required,
  url,
} from "@decaf-ts/decorator-validation";
import { uielement, uimodel } from "../../src";
import { id, OperationKeys } from "@decaf-ts/db-decorators";
import { hideOn } from "../../src";

export const usedDateFormat = "yyyy/MM/dd";

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

@uimodel("decaf-crud-form", { test: "1" })
@model()
export class DemoModel extends Model {
  @id()
  // @hideOn(OperationKeys.CREATE, OperationKeys.UPDATE)
  @uielement("decaf-crud-field", { label: "translation.demo.id.label" })
  id!: number;

  @required()
  @minlength(5)
  @uielement("decaf-crud-field", {
    label: "translation.demo.name.label",
    placeholder: "translation.demo.name.placeholder",
  })
  name!: string;

  @date(usedDateFormat)
  @required()
  @uielement("decaf-crud-field", { label: "translation.demo.birthdate.label" })
  birthdate!: Date;

  @required()
  @uielement("decaf-crud-field", { label: "translation.demo.year.label" })
  year!: number;

  @required()
  @email()
  @uielement("decaf-crud-field", { label: "translation.demo.email.label" })
  email!: string;

  @url()
  @uielement("decaf-crud-field", { label: "translation.demo.website.label" })
  website!: string;

  @required()
  @password()
  @uielement("decaf-crud-field", { label: "translation.demo.password.label" })
  password!: string;

  constructor(arg?: ModelArg<DemoModel>) {
    super(arg);
  }
}
