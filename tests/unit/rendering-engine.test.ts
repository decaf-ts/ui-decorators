import { RenderingEngine, uielement } from "../../src";
import { DemoModel, TestClass } from "./models";
import { FieldDefinition } from "../../src/ui/types";
import {
  date,
  minlength,
  Model,
  required,
  url,
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
      email: "email@example.com",
      website: "https://example.com",
      password: "Password123!",
    });
  });

  it("Generates FieldDefinitions", async () => {
    const definition = engine.render(testModel, { operation: "create" });
    expect(definition).toBeDefined();
    expect(definition.tag).toEqual("decaf-crud-form");
    expect(definition.props).toEqual({ operation: "create", test: "1" });
    expect(definition.children).toBeDefined();
    if (!definition.children) throw new Error("Children not defined");
    expect(definition.children?.length).toEqual(7);

    function parseType(key: string): string {
      switch (key) {
        case "birthdate":
          return "date";
        case "year":
          return "number";
        case "password":
          return "password";
        case "email":
          return "email";
        default:
          return "text";
      }
    }

    ["id", "name", "birthdate", "year", "email", "website", "password"].forEach(
      (key, i) => {
        if (!definition.children) throw new Error("Child not defined");
        expect(definition.children[i].tag).toEqual("decaf-crud-field");

        const propsExpectancy: any = {
          label: key,
          type: parseType(key),
        };

        if (key !== "website") {
          propsExpectancy["required"] = true;
        }

        if (key === "name") {
          propsExpectancy["minlength"] = 5;
        }

        if (["email", "url", "password"].includes(key)) {
          propsExpectancy["pattern"] = expect.any(RegExp);
        }

        expect(definition.children[i].props).toEqual({
          name: key,
          operation: "create",
          props: propsExpectancy,
        });
      }
    );
  });
});
