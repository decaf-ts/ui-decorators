import { UIKeys } from "../../src";
import { TestClass } from "./models";
import { Metadata } from "@decaf-ts/decoration";
import { Model } from "@decaf-ts/decorator-validation";

describe(`UI decorators Test`, function () {
  let testModel: TestClass;

  beforeEach(() => {
    testModel = new TestClass({
      name: "test",
    });
  });

  it("Decorates The class properly", function () {
    const meta = Metadata.get(TestClass, UIKeys.REFLECT);
    expect(meta).toBeDefined();
    expect(meta[UIKeys.UIMODEL]).toBeDefined();
  });

  it("Decorates the properties properly", function () {
    const uiElementDec = Model.uiElementOf(TestClass, "name");
    const { tag, props } = uiElementDec;

    expect(tag).toEqual("input-element");
    expect(props).toBeDefined();
    expect(props.subtype).toEqual("OtherTest");
  });

  it("Must be hidden property on create", function () {
    const decorator = Model.uiElementOf(TestClass, "hiddenProp");
    const { tag, props } = decorator;

    expect(tag).toEqual("input-element");
    expect(props).toBeDefined();
    expect(Model.uiIsHidden(TestClass, "hiddenProp")).toBeTruthy();
  });

  it("Adds the render method properly", function () {
    expect(testModel.render).toBeDefined();
    expect(() => {
      testModel.render();
    }).toThrowError();
  });
});
