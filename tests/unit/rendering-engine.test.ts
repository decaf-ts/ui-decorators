import {
  FieldDefinition,
  RenderingEngine,
  uichild,
  uielement,
  UIKeys,
  uimodel,
  uiprop,
  ValidatableByAttribute,
} from "../../src";
import {
  AddressModel,
  DemoModel,
  NeighborModel,
  ParentModel,
  usedDateFormat,
} from "./models";
import {
  ComparisonValidationKeys,
  minlength,
  model,
  Model,
  ModelArg,
  required,
  ValidationMetadata,
} from "@decaf-ts/decorator-validation";

// @ts-expect-error stoopid jest
Model.setBuilder(Model.fromModel);

describe("Rendering Engine", () => {
  class TestEngine extends RenderingEngine<void> {
    constructor(flavour: string) {
      super(flavour);
    }

    render<M extends Model>(
      model: M,
      globalProps: Record<string, unknown>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ...args: any[]
    ): FieldDefinition<void> {
      return this.toFieldDefinition(model, globalProps);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async initialize(...args: any[]): Promise<void> {
      this.initialized = true;
    }
  }

  let engine: RenderingEngine;

  beforeAll(async () => {
    engine = new TestEngine("test");
    await engine.initialize();
  });

  let testModel: DemoModel;

  beforeEach(() => {
    testModel = new DemoModel({
      id: 1,
      name: "name",
      birthdate: new Date(),
      year: 2022,
      email: "email@example.com",
      website: "https://example.com",
      password: "Password123!",
    });
  });

  it("Generates FieldDefinitions", async () => {
    const definition = engine.render(testModel, { operation: "create" });
    expect(definition).toBeDefined();
    expect(definition.tag).toEqual("decaf-crud-form");
    expect(definition.rendererId).toBeDefined();
    expect(definition.props).toEqual({
      operation: "create",
      test: "1",
      handlers: {},
    });
    expect(definition.children).toBeDefined();
    if (!definition.children) throw new Error("Children not defined");
    expect(definition.children?.length).toEqual(7);

    function parseType(key: string): string {
      switch (key) {
        case "birthdate":
          return "date";
        case "id":
        case "year":
          return "number";
        case "password":
          return "password";
        case "email":
          return "email";
        case "website":
          return "url";
        default:
          return "text";
      }
    }

    const additionalProps: any = {
      id: {
        required: true,
      },
      name: {
        required: true,
        minlength: 5,
        different: "email",
        placeholder: `translation.demo.name.placeholder`,
      },
      birthdate: {
        required: true,
        format: usedDateFormat,
        value: testModel["birthdate"].toString(),
      },
      year: { required: true },
      email: { required: true },
      website: {},
      password: { required: true },
    };

    ["id", "name", "birthdate", "year", "email", "website", "password"].forEach(
      (key, i) => {
        // eslint-disable-next-line no-useless-catch
        try {
          if (!definition.children) throw new Error("Child not defined");

          expect(definition.children[i].tag).toEqual("decaf-crud-field");

          const propsExpectancy: any = {
            label: `translation.demo.${key}.label`,
            type: parseType(key),
            value: testModel[key as keyof DemoModel],
            path: key,
            childOf: undefined,
            ...(additionalProps[key] || {}),
          };

          expect(definition.children[i].props).toEqual(
            Object.assign(
              {
                name: key,
                operation: "create",
              },
              propsExpectancy
            )
          );
        } catch (e: unknown) {
          throw e;
        }
      }
    );
  });

  it("Should throw when an invalid key is provided", () => {
    const invalidKey = "invalidKey";
    const randomValue = Math.random().toString();
    expect(() => {
      engine["toAttributeValue"](invalidKey, {
        [invalidKey]: randomValue,
        message: "Should throw an error",
      });
    }).toThrowError(
      new Error(
        `Invalid attribute key "${invalidKey}". Expected one of: ${Object.keys(ValidatableByAttribute).join(", ")}.`
      )
    );
  });

  describe("toFieldDefinition", () => {
    it("should assign props when uiprop is a common type", () => {
      @uimodel("decaf-crud-form")
      @model()
      class RootModel extends Model {
        @uiprop()
        nested: string = "just a string";

        constructor() {
          super();
        }
      }

      const root = new RootModel();
      const def = engine["toFieldDefinition"](root, {});

      expect(def.children).toBeUndefined();
      // expect(def.childProps?.nested).toEqual({ name: "nested" });
    });

    it("should call toFieldDefinition for submodel if it is constructable", () => {
      const neighbor = new NeighborModel({
        name: "neighbor.name",
        address: new AddressModel({
          street: "address.street",
          zipcode: Math.floor(Math.random() * 100000) + 100000,
        }),
      });
      const model = new ParentModel({
        name: "parent.name",
        neighbor: new NeighborModel({
          name: "neighbor.name",
          address: neighbor,
        }),
      });
      const globalProps = { operation: "create", dummy: "prop", handlers: {}, multiple: false };
      const def = engine["toFieldDefinition"](model, globalProps);

      expect(def.tag).toEqual("decaf-crud-form");
      expect(def.props).toEqual(globalProps);
      expect(def.children).toHaveLength(Object.keys(model).length);

      const neighborDef = (
        def.children as FieldDefinition[]
      ).pop() as FieldDefinition;
      expect(neighborDef.tag).toEqual("fieldset-neighbor-component");
      expect(neighborDef.props).toEqual({ 
        ...globalProps,
        name: "NeighborModel",
        childOf: "neighbor",
        model: undefined,
      });
      expect(neighborDef.children).toHaveLength(
        Object.keys(model.neighbor).length
      );

      const addressDef = (
        neighborDef.children as FieldDefinition[]
      ).pop() as FieldDefinition;
      expect(addressDef.tag).toEqual("fieldset-address-component");
      expect(addressDef.props).toEqual({
        ...globalProps,
        name: "AddressModel",
        childOf: "neighbor.address",
      });
      expect(addressDef.children).toHaveLength(
        Object.keys(model.neighbor.address).length
      );
    });

    it("should call toFieldDefinition for submodel if it is undefined", () => {
      const model = new ParentModel({});
      expect(model.neighbor).toBeUndefined();
      expect(Model.isPropertyModel(model, "neighbor")).toBeTruthy();

      const globalProps = { operation: "update", handlers: {}, multiple: false };
      const def = engine["toFieldDefinition"](model, globalProps);

      expect(def.tag).toEqual("decaf-crud-form");
      expect(def.props).toEqual(globalProps);
      expect(def.children).toHaveLength(Object.keys(model).length);

      const neighborDef = (
        def.children as FieldDefinition[]
      ).pop() as FieldDefinition;
      const nModel = neighborDef.props?.['model'];
      expect(neighborDef.tag).toEqual("fieldset-neighbor-component");
      expect(neighborDef.props).toEqual({
        ...globalProps,
        name: "NeighborModel",
        childOf: "neighbor",
        model: nModel
      });
      expect(neighborDef.children).toHaveLength(
        Object.keys(new NeighborModel({})).length
      );

      const addressDef = (
        neighborDef.children as FieldDefinition[]
      ).pop() as FieldDefinition;
      expect(addressDef.tag).toEqual("fieldset-address-component");
      expect(addressDef.props).toEqual({
        ...globalProps,
        name: "AddressModel",
        childOf: "neighbor.address",
        model: nModel
      });
      expect(addressDef.children).toHaveLength(
        Object.keys(new AddressModel({})).length
      );
    });

    it("should throw if @uimodel decorator is missing", () => {
      @model()
      class NoUIModel extends Model {
        @required()
        @minlength(3)
        @uielement("ngx-decaf-crud-field", { label: "Name" })
        name!: string;

        constructor(arg?: ModelArg<NoUIModel>) {
          super(arg);
        }
      }

      expect(() =>
        engine["toFieldDefinition"](new NoUIModel({}), {})
      ).toThrowError(
        `No ui definitions set for model NoUIModel. Did you use @uimodel?`
      );
    });

    it("should throw if decorated with both @uielement and @uiprop", () => {
      @uimodel("ui-model-component")
      @model()
      class TestModel extends Model {
        @required()
        @minlength(3)
        @uielement("ngx-decaf-crud-field", { label: "Name" })
        @uiprop("ngx-decaf-crud-field")
        name!: string;

        constructor(arg?: ModelArg<TestModel>) {
          super(arg);
        }
      }

      expect(() =>
        engine["toFieldDefinition"](new TestModel({}), {})
      ).toThrowError(
        `Only one type of decoration is allowed. Please choose between @uiprop, @uichild or @uielement`
      );
    });

    it("should throw if @uichild is not a model", () => {
      @uimodel("ui-model-component")
      @model()
      class TestModel extends Model {
        @required()
        @uichild("name", "component-tag")
        name!: string;

        constructor(arg?: ModelArg<TestModel>) {
          super(arg);
        }
      }

      expect(() =>
        engine["toFieldDefinition"](new TestModel({}), {})
      ).toThrowError(`Child "name" must be a model`);
    });
  });

  describe("toAttributeValue", () => {
    const validationMetadata = Object.values(UIKeys).reduce(
      (acc, k) => {
        const r = Math.random();
        acc[k] = Object.values(ComparisonValidationKeys).includes(k as any)
          ? r.toString(36).toUpperCase()
          : r;
        return acc;
      },
      {} as Record<string, any>
    );
    // validationMetadata["propertyToCompare"] = Math.random().toString();

    it("required key", () => {
      const result = engine["toAttributeValue"](
        UIKeys.REQUIRED,
        validationMetadata as ValidationMetadata
      );
      expect(typeof result).toBe("boolean");
      expect(result).toBeTruthy();
    });

    it("regular keys", () => {
      const regularKeys = Object.keys(validationMetadata).filter((k) => {
        return (
          Object.keys(ValidatableByAttribute).includes(k) &&
          !Object.values(ComparisonValidationKeys).includes(k as any) &&
          k !== UIKeys.REQUIRED
        );
      });
      regularKeys.forEach((key) => {
        const result = engine["toAttributeValue"](
          key,
          validationMetadata as ValidationMetadata
        );
        expect(typeof result).toEqual("number");
        expect(result).toBe(validationMetadata[key]);
      });
    });

    it("comparison keys", () => {
      Object.values(ComparisonValidationKeys).forEach((key) => {
        const result = engine["toAttributeValue"](
          key,
          validationMetadata as ValidationMetadata
        );
        expect(typeof result).toEqual("string");
        expect(result).toBe(validationMetadata[key]);
      });
    });

    it("invalid keys", () => {
      const regularKeys = Object.keys(validationMetadata).filter((k) => {
        return (
          !Object.keys(ValidatableByAttribute).includes(k) &&
          !Object.values(ComparisonValidationKeys).includes(k as any) &&
          k !== UIKeys.REQUIRED
        );
      });

      regularKeys.forEach((key) => {
        expect(() =>
          engine["toAttributeValue"](
            key,
            validationMetadata as ValidationMetadata
          )
        ).toThrowError(
          new RegExp(`Invalid attribute key "${key}". Expected one of:`)
        );
      });
    });
  });
});
