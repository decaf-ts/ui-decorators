import { RenderingEngine } from "../../src";
import { DemoModel, usedDateFormat } from "./models";
import { FieldDefinition } from "../../src/ui/types";
import { Model } from "@decaf-ts/decorator-validation";

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
});
