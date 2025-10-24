import { ModelKeys } from "@decaf-ts/decorator-validation";
import { Reflection } from "@decaf-ts/reflection";
import { UIKeys } from "../../src";
import { TestClass } from "./models";

describe(`UI decorators Test`, function () {
  let testModel: TestClass;

  beforeEach(() => {
    testModel = new TestClass({
      name: "test",
    });
  });

  it("Decorates The class properly", function () {
    let decorators: any[] = Reflection.getClassDecorators(
      ModelKeys.REFLECT,
      testModel
    );

    expect(decorators).toBeDefined();
    expect(decorators.length).toBe(5);
    expect(decorators[decorators.length - 1].key).toEqual(ModelKeys.MODEL);

    decorators = Reflection.getClassDecorators(UIKeys.REFLECT, testModel);
    expect(decorators).toBeDefined();
    expect(decorators.length).toBe(4);
    expect(decorators[0].key).toEqual(UIKeys.UIMODEL);
  });

  it("Decorates the properties properly", function () {
    const propertyDecorators: { [indexer: string]: any } =
      Reflection.getPropertyDecorators(
        UIKeys.REFLECT,
        testModel,
        "name",
        false
      );  

    expect(propertyDecorators).toBeDefined();
    expect(propertyDecorators.decorators.length).toEqual(5);
    expect(propertyDecorators.decorators[1].key).toEqual(UIKeys.ELEMENT);

    const { tag, props } = propertyDecorators.decorators[1].props;

    expect(tag).toEqual("input-element");
    expect(props).toBeDefined();
    expect(props.subtype).toEqual("OtherTest");
  }); 

  it("Must be hidden property on create", function () {
    const propertyDecorators: { [indexer: string]: any } =
        Reflection.getPropertyDecorators(
          UIKeys.REFLECT,
          testModel,
          "hiddenProp",
          false
        );
      
      expect(propertyDecorators).toBeDefined();
      expect(propertyDecorators.decorators.length).toEqual(3);
      expect(propertyDecorators.decorators[1].key).toEqual(UIKeys.ELEMENT);

      const { tag, props } = propertyDecorators.decorators[1].props;

      expect(tag).toEqual("input-element");
      expect(props).toBeDefined();
      expect(Object.values(propertyDecorators.decorators).some(d => (d as Record<string, string>).key === UIKeys.HIDDEN)).toBeTruthy();
    });


  it("Adds the render method properly", function () {
    expect(testModel.render).toBeDefined();
    expect(() => {
      testModel.render();
    }).toThrowError();
  });
});
