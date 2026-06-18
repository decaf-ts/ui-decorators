import "../../src";
import { Metadata } from "@decaf-ts/decoration";
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { RenderingEngine as UiRenderingEngine, uielement } from "../../src";
import {
  node,
  port,
  graphDefinitionOf,
  graphPortDefinitionOf,
} from "../../src/graph";
import { GraphKeys, PortDirection } from "../../src/graph";
import { UIKeys } from "../../src/ui/constants";

@node("graph-tool", {
  kind: "tool",
  category: "AI",
  icon: "tool",
  color: "#2196f3",
})
@model()
class GraphToolModel extends Model {
  @required()
  @uielement("input", { label: "Prompt" })
  @port(PortDirection.INPUT, { handle: "prompt" })
  prompt!: string;

  @uielement("textarea", { label: "Result" })
  @port(PortDirection.OUTPUT)
  result!: string;
}

class GraphRenderer extends UiRenderingEngine<void, unknown> {
  constructor() {
    super("graph");
  }

  async initialize(): Promise<void> {
    return;
  }
}

describe("ui-decorators graph layer", () => {
  it("composes node metadata with uimodel metadata", () => {
    const uiModel = Metadata.get(
      GraphToolModel,
      Metadata.key(UIKeys.REFLECT, UIKeys.UIMODEL)
    );
    const graph = Metadata.get(GraphToolModel, GraphKeys.NODE);

    expect(uiModel).toEqual({
      tag: "graph-tool",
      props: undefined,
    });
    expect(graph).toEqual({
      kind: "tool",
      category: "AI",
      icon: "tool",
      color: "#2196f3",
    });
  });

  it("derives port metadata from the existing property metadata", () => {
    const promptPort = graphPortDefinitionOf(GraphToolModel, "prompt");

    expect(promptPort).toMatchObject({
      property: "prompt",
      direction: PortDirection.INPUT,
      label: "Prompt",
      required: true,
      hidden: false,
      graph: {
        direction: PortDirection.INPUT,
        handle: "prompt",
      },
    });
    expect(promptPort?.type).toBe("string");
    expect(promptPort?.designType).toBe("String");
  });

  it("builds a framework-neutral graph definition", () => {
    const definition = graphDefinitionOf(GraphToolModel);

    expect(definition).toMatchObject({
      name: "GraphToolModel",
      tag: "graph-tool",
      kind: "tool",
      category: "AI",
      icon: "tool",
      color: "#2196f3",
      ports: [
        expect.objectContaining({
          property: "prompt",
          direction: PortDirection.INPUT,
        }),
        expect.objectContaining({
          property: "result",
          direction: PortDirection.OUTPUT,
        }),
      ],
    });
  });

  it("exposes renderAsNode as a graph definition reader", () => {
    const engine = new GraphRenderer() as any;
    const rendered = engine.renderAsNode(
      new GraphToolModel(),
      {}
    ) as ReturnType<typeof graphDefinitionOf>;

    expect(rendered.tag).toBe("graph-tool");
    expect(rendered.ports).toHaveLength(2);
  });
});
