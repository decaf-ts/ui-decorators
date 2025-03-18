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

@uimodel("decaf-crud-form", { test: "1" })
@model()
export class DemoModel extends Model {
  @id()
  @uielement("decaf-crud-field", { props: { label: "id" } })
  id!: number;

  @required()
  @minlength(5)
  @uielement("decaf-crud-field", { props: { label: "name" } })
  name!: string;

  @date("yyyy/MM/dd")
  @required()
  @uielement("decaf-crud-field", { props: { label: "birthdate" } })
  birthdate!: Date;

  @required()
  @uielement("decaf-crud-field", { props: { label: "year" } })
  year!: number;

  @required()
  @email()
  @uielement("decaf-crud-field", { props: { label: "email" } })
  email!: string;

  @url()
  @uielement("decaf-crud-field", { props: { label: "website" } })
  website!: string;

  @required()
  @password()
  @uielement("decaf-crud-field", { props: { label: "password" } })
  password!: string;

  constructor(arg?: ModelArg<DemoModel>) {
    super(arg);
  }
}
