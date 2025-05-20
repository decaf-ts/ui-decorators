import type { FieldDefinition } from "../../src";
import { RenderingEngine, UIKeys, ValidatableByAttribute } from "../../src";
import { DemoModel, usedDateFormat } from "./models";
import {
  ComparisonValidationKeys,
  Model,
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
    expect(definition.props).toEqual({ operation: "create", test: "1" });
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
          };

          if (key !== "website") {
            propsExpectancy["required"] = true;
          }

          if (key === "birthdate") {
            propsExpectancy["format"] = usedDateFormat;
            propsExpectancy["value"] = propsExpectancy["value"].toString();
          }

          if (key === "name") {
            propsExpectancy["minlength"] = 5;
            propsExpectancy["different"] = "email";
            propsExpectancy["placeholder"] =
              `translation.demo.${key}.placeholder`;
          }

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
