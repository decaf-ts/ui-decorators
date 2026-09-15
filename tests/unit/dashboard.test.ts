import "../../src";
import * as uiDecorators from "../../src";
import type { DashComponentMetadata } from "../../src";
import { Model, model, ModelBuilder } from "@decaf-ts/decorator-validation";
import { DashKeys } from "../../src/dashboard/constants";
import {
  dashComponentMetadataOf,
  dashComponentDefinitionOf,
} from "../../src/dashboard/reader";
import {
  dashComponents,
  resetDashComponentRegistry,
} from "../../src/dashboard/registry";
import { dashcomponent } from "../../src/dashboard/decorators";

describe("ui-decorators dashboard", () => {
  describe("@dashcomponent() decorator + registry", () => {
    it("marks a class as dashboard-selectable; metadata via dashComponentMetadataOf", () => {
      @dashcomponent("my.widget", {
        label: "my.widget.label",
        defaultSize: { cols: 2, rows: 1 },
      })
      @model()
      class MyWidget extends Model {}

      const metadata = dashComponentMetadataOf(MyWidget);
      expect(metadata).toBeDefined();
      expect(metadata?.tag).toBe("my.widget");
      expect(metadata?.label).toBe("my.widget.label");
      expect(metadata?.defaultSize).toEqual({ cols: 2, rows: 1 });
    });

    it("registers the constructor in dashComponents() registry", () => {
      resetDashComponentRegistry();

      @dashcomponent("my.widget", { label: "my.widget.label" })
      @model()
      class MyWidget extends Model {}

      @dashcomponent("other.widget", { label: "other.widget.label" })
      @model()
      class OtherWidget extends Model {}

      const components = dashComponents();
      expect(components).toContain(MyWidget);
      expect(components).toContain(OtherWidget);
      expect(components).toHaveLength(2);
    });

    it("undecorated classes are absent from dashComponents()", () => {
      resetDashComponentRegistry();

      @model()
      class PlainModel extends Model {}

      const components = dashComponents();
      expect(components).not.toContain(PlainModel);
    });

    it("dashComponentMetadataOf returns undefined for undecorated classes", () => {
      @model()
      class PlainModel extends Model {}

      expect(dashComponentMetadataOf(PlainModel)).toBeUndefined();
    });

    it("derives tag from class name in the definition when no tag is provided", () => {
      @dashcomponent()
      @model()
      class UntaggedWidget extends Model {}

      const definition = dashComponentDefinitionOf(UntaggedWidget);
      expect(definition.name).toBe("UntaggedWidget");
      expect(definition.tag).toBe("UntaggedWidget");
    });

    it("applies a default defaultSize when none is specified", () => {
      @dashcomponent("default.widget")
      @model()
      class DefaultWidget extends Model {}

      const metadata = dashComponentMetadataOf(DefaultWidget);
      expect(metadata?.defaultSize).toEqual({ cols: 1, rows: 1 });
    });

    it("resolves an instance to its constructor metadata", () => {
      resetDashComponentRegistry();

      @dashcomponent("my.widget", {
        label: "my.widget.label",
        defaultSize: { cols: 2, rows: 1 },
      })
      @model()
      class MyWidget extends Model {}

      const metadata = dashComponentMetadataOf(new MyWidget());
      expect(metadata).toBeDefined();
      expect(metadata?.tag).toBe("my.widget");
    });

    it("dashComponentDefinitionOf normalizes defaults", () => {
      @dashcomponent("other.widget", {
        label: "other.widget.label",
      })
      @model()
      class OtherWidget extends Model {}

      const definition = dashComponentDefinitionOf(OtherWidget);
      expect(definition.name).toBe("OtherWidget");
      expect(definition.tag).toBe("other.widget");
      expect(definition.label).toBe("other.widget.label");
      expect(definition.defaultSize).toEqual({ cols: 1, rows: 1 });
    });
  });

  describe("pure decaf — no ad-hoc imperative registration", () => {
    it("decorator + registry provide the wiring without manual registration", () => {
      resetDashComponentRegistry();

      @dashcomponent("pure.decaf.widget")
      @model()
      class PureDecafWidget extends Model {}

      const components = dashComponents();
      expect(components).toContain(PureDecafWidget);
      expect(components).toHaveLength(1);
    });
  });

  describe("AC-11: ModelBuilder.setName deterministic class name", () => {
    it("build() with no name throws", () => {
      const builder = ModelBuilder.builder<Model>();
      expect(() => builder.build()).toThrow("name is required");
    });

    it("with a name sets the class name deterministically", () => {
      const builder = ModelBuilder.builder<Model>();
      builder.setName("TestWidget");
      const result = builder.build();
      expect(result.name).toBe("TestWidget");
    });

    it("setName produces the same generated class name across builds", () => {
      const builder1 = ModelBuilder.builder<Model>();
      builder1.setName("ConsistentName");
      const result1 = builder1.build();

      const builder2 = ModelBuilder.builder<Model>();
      builder2.setName("ConsistentName");
      const result2 = builder2.build();

      expect(result1.name).toBe("ConsistentName");
      expect(result2.name).toBe("ConsistentName");
    });
  });

  describe("package entry exports", () => {
    it("re-exports the dashboard value symbols from the package entry", () => {
      expect(uiDecorators.dashcomponent).toBe(dashcomponent);
      expect(uiDecorators.dashComponents).toBe(dashComponents);
      expect(uiDecorators.registerDashComponent).toBeDefined();
      expect(uiDecorators.DashKeys).toEqual(DashKeys);
    });

    it("carries the DashComponentMetadata type from the package entry", () => {
      const meta: DashComponentMetadata = {
        tag: "typed.widget",
        label: "typed.widget.label",
        defaultSize: { cols: 3, rows: 2 },
      };
      expect(meta.tag).toBe("typed.widget");
      expect(meta.defaultSize).toEqual({ cols: 3, rows: 2 });
    });
  });
});
