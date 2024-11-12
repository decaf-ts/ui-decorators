import {
  maxlength,
  minlength,
  Model,
  model,
  ModelArg,
  required,
} from "@decaf-ts/decorator-validation";
import { uielement, uimodel } from "../../src";

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
