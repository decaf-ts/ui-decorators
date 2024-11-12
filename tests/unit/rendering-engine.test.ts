import { RenderingEngine } from "../../src";
import { TestClass } from "./models";
import { FieldDefinition } from "../../src/ui/types";
import { Model } from "@decaf-ts/decorator-validation";

// @ts-expect-error stoopid jest
Model.setBuilder(Model.fromModel);

describe("Rendering Engine", () => {
  class TestEngine extends RenderingEngine<void> {
    constructor(flavour: string) {
      super(flavour);
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

  let testModel: TestClass;

  beforeEach(() => {
    testModel = new TestClass({
      name: "test",
    });
  });

  it("Generates FieldDefinitions", async () => {
    const definition: FieldDefinition = engine.render(testModel);
    expect(definition).toBeDefined();
  });
});
