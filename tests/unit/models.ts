import {
  date,
  diff,
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
import {
  hideOn,
  renderedBy,
  uichild,
  uielement,
  uihandlers,
  uilayout,
  uilayoutprop,
  uilistmodel,
  uilistprop,
  uimodel,
  uiorder,
  uipageprop,
  uisteppedmodel,
} from "../../src";
import { id, OperationKeys } from "@decaf-ts/db-decorators";

export const usedDateFormat = "yyyy/MM/dd";

export class BaseTestClass extends Model {
  constructor(model?: ModelArg<BaseTestClass>) {
    super(model);
  }
}

@model()
@uisteppedmodel("component", 1, true)
@renderedBy("angular")
@uilistmodel()
@uihandlers({ handler: () => null })
@uilayout("layout-component")
export class TestClass extends Model {
  @required()
  @minlength(5)
  @maxlength(15)
  @uiorder(5)
  @uilistprop("propName")
  @uilayoutprop(1, 1)
  @uipageprop(1)
  @uielement("input-element", { subType: "OtherTest" })
  name!: string;

  @hideOn(OperationKeys.CREATE)
  @uipageprop(1)
  @uielement("input-element", { subType: "HiddenTest" })
  hiddenProp!: string;

  constructor(model?: ModelArg<TestClass>) {
    super(model);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function render() {
  return "test";
}

@uimodel("decaf-crud-form", { test: "1" })
@uilistmodel("ngx-decaf-list-item", { icon: "cafe-outline" })
@model()
export class DemoModel extends Model {
  @id()
  // @hideOn(OperationKeys.CREATE, OperationKeys.UPDATE)
  @uielement("decaf-crud-field", { label: "translation.demo.id.label" })
  id!: number;

  @required()
  @minlength(5)
  @diff("email")
  @uielement("decaf-crud-field", {
    label: "translation.demo.name.label",
    placeholder: "translation.demo.name.placeholder",
  })
  @hideOn(OperationKeys.UPDATE)
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

  @required()
  @uielement("ngx-decaf-crud-field", {
    label: "demo.agree.label",
    type: "checkbox",
  })
  @hideOn(OperationKeys.DELETE, OperationKeys.UPDATE, OperationKeys.READ)
  agree!: string;

  constructor(arg?: ModelArg<DemoModel>) {
    super(arg);
  }
}

@uimodel("decaf-address-form")
@model()
export class AddressModel extends Model {
  @id()
  @uielement("ngx-decaf-crud-field", { label: "Address id" })
  id!: number;

  @required()
  @uielement("ngx-decaf-crud-field", { label: "Street" })
  street!: string;

  @uielement("ngx-decaf-crud-field", { label: "Zipcode" })
  zipcode?: number;

  constructor(arg?: ModelArg<AddressModel>) {
    super(arg);
  }
}

@uimodel("decaf-crud-form")
@model()
export class NeighborModel extends Model {
  @id()
  @uielement("ngx-decaf-crud-field", { label: "Neighbor id" })
  id!: string;

  @required()
  @uielement("ngx-decaf-crud-field", { label: "Neighbor name" })
  name!: string;

  // @type(AddressModel.name)
  @uichild(AddressModel.name, "fieldset-address-component")
  address!: AddressModel;

  constructor(arg?: ModelArg<NeighborModel>) {
    super(arg);
  }
}

@uimodel("decaf-crud-form")
@model()
export class ParentModel extends Model {
  @id()
  @uielement("ngx-decaf-crud-field", { label: "Parent id" })
  id!: number;

  @required()
  @minlength(3)
  @uielement("ngx-decaf-crud-field", { label: "Parent name" })
  name!: string;

  // @required()
  // @type(NeighborModel.name)
  @uichild(NeighborModel.name, "fieldset-neighbor-component")
  neighbor!: NeighborModel;

  constructor(arg?: ModelArg<ParentModel>) {
    super(arg);
  }
}
