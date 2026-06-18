import "../../src";
import { Metadata } from "@decaf-ts/decoration";
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { RenderingEngine as UiRenderingEngine, uielement } from "../../src";
import {
  graph,
  graphLeafPortsOf,
  graphWorkflowSnapshotFromJSON,
  graphWorkflowSnapshotInputValuesOf,
  graphWorkflowSnapshotOf,
  graphWorkflowSnapshotOutputValuesOf,
  graphWorkflowSnapshotRestore,
  graphWorkflowSnapshotToJSON,
  graphWorkflowDefinitionOf,
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

@graph("graph-workflow", {
  kind: "workflow",
  category: "Workflow",
  nodes: [
    {
      id: "draft",
      kind: "node",
      label: "Draft node",
      node: "GraphDraftNode",
    },
    {
      id: "review",
      kind: "node",
      label: "Review node",
      node: "GraphReviewNode",
    },
  ],
  relations: [
    {
      source: "workflow",
      sourcePort: "brief",
      target: "draft",
      targetPort: "plan",
      label: "brief-to-plan",
    },
    {
      source: "draft",
      sourcePort: "draft",
      target: "review",
      targetPort: "draft",
      label: "draft-to-review",
    },
  ],
})
@model()
class GraphWorkflowModel extends Model {
  @required()
  @uielement("input", { label: "Brief" })
  @port(PortDirection.INPUT)
  brief!: string;

  @required()
  @uielement("input", { label: "Approved" })
  @port(PortDirection.OUTPUT)
  approved!: string;
}

@node("graph-address", {
  kind: "node",
  category: "AI",
})
@model()
class GraphAddressModel extends Model {
  @required()
  @uielement("input", { label: "Street" })
  @port(PortDirection.INPUT)
  street!: string;

  @required()
  @uielement("input", { label: "City" })
  @port(PortDirection.INPUT)
  city!: string;
}

@node("graph-company", {
  kind: "node",
  category: "AI",
})
@model()
class GraphCompanyModel extends Model {
  @required()
  @uielement("input", { label: "Name" })
  @port(PortDirection.INPUT)
  name!: string;

  @required()
  @uielement("input", { label: "Address" })
  @port(PortDirection.INPUT)
  address!: GraphAddressModel;
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

  it("expands nested model ports into a composite port tree", () => {
    const addressPort = graphPortDefinitionOf(GraphCompanyModel, "address");
    const definition = graphDefinitionOf(GraphCompanyModel);
    const leafPorts = graphLeafPortsOf(definition.ports);

    expect(addressPort).toMatchObject({
      property: "address",
      path: "address",
      composite: true,
      children: [
        expect.objectContaining({
          property: "street",
          path: "address.street",
        }),
        expect.objectContaining({
          property: "city",
          path: "address.city",
        }),
      ],
    });
    expect(leafPorts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: "name",
          path: "name",
        }),
        expect.objectContaining({
          property: "street",
          path: "address.street",
        }),
        expect.objectContaining({
          property: "city",
          path: "address.city",
        }),
      ])
    );
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

  it("decorates a workflow root with graph metadata and derived inputs/outputs", () => {
    const workflowMeta = Metadata.get(GraphWorkflowModel, GraphKeys.GRAPH);
    const workflowUi = Metadata.get(
      GraphWorkflowModel,
      Metadata.key(UIKeys.REFLECT, UIKeys.UIMODEL)
    );
    const definition = graphWorkflowDefinitionOf(GraphWorkflowModel);

    expect(workflowUi).toEqual({
      tag: "graph-workflow",
      props: undefined,
    });
    expect(workflowMeta).toMatchObject({
      kind: "workflow",
      category: "Workflow",
      inputs: [
        expect.objectContaining({
          property: "brief",
          direction: PortDirection.INPUT,
        }),
      ],
      outputs: [
        expect.objectContaining({
          property: "approved",
          direction: PortDirection.OUTPUT,
        }),
      ],
      nodes: [
        expect.objectContaining({
          id: "draft",
          label: "Draft node",
        }),
        expect.objectContaining({
          id: "review",
          label: "Review node",
        }),
      ],
      relations: [
        expect.objectContaining({
          source: "workflow",
          target: "draft",
        }),
        expect.objectContaining({
          source: "draft",
          target: "review",
        }),
      ],
    });
    expect(definition).toMatchObject({
      name: "GraphWorkflowModel",
      tag: "graph-workflow",
      kind: "workflow",
      category: "Workflow",
      inputs: [
        expect.objectContaining({
          property: "brief",
          direction: PortDirection.INPUT,
        }),
      ],
      outputs: [
        expect.objectContaining({
          property: "approved",
          direction: PortDirection.OUTPUT,
        }),
      ],
      nodes: expect.arrayContaining([
        expect.objectContaining({
          id: "draft",
        }),
        expect.objectContaining({
          id: "review",
        }),
      ]),
      relations: expect.arrayContaining([
        expect.objectContaining({
          label: "brief-to-plan",
        }),
      ]),
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

  it("serializes workflow graph state into a framework-neutral snapshot", () => {
    const snapshot = graphWorkflowSnapshotOf(GraphWorkflowModel, {
      inputs: {
        brief: "Draft a publishing workflow for the next product release.",
      },
      outputs: {
        approved: true,
      },
      nodes: [
        {
          id: "draft",
          position: { x: 120, y: 240 },
          expanded: true,
          data: {
            pinned: false,
          },
        },
        {
          id: "workflow:brief:value",
          ref: {
            id: "brief",
            path: "brief",
            property: "brief",
          },
          position: { x: 20, y: 180 },
          ports: {
            output: {
              expanded: true,
              value: "Draft a publishing workflow for the next product release.",
            },
          },
        },
      ],
      edges: [
        {
          id: "workflow-brief-to-draft",
          source: "workflow:brief:value",
          sourceRef: "brief",
          sourcePort: "output",
          target: "draft",
          targetRef: "draft",
          targetPort: "plan",
        },
      ],
      ui: {
        zoom: 1.1,
      },
      metadata: {
        dirty: true,
      },
    });

    expect(snapshot).toMatchObject({
      version: 1,
      definition: {
        name: "GraphWorkflowModel",
        tag: "graph-workflow",
        kind: "workflow",
        inputs: [
          expect.objectContaining({
            property: "brief",
            direction: PortDirection.INPUT,
          }),
        ],
        outputs: [
          expect.objectContaining({
            property: "approved",
            direction: PortDirection.OUTPUT,
          }),
        ],
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "draft",
          }),
          expect.objectContaining({
            id: "review",
          }),
        ]),
      },
      state: {
        inputs: [
          expect.objectContaining({
            path: "brief",
            value: "Draft a publishing workflow for the next product release.",
          }),
        ],
        outputs: [
          expect.objectContaining({
            path: "approved",
            value: true,
          }),
        ],
        ui: {
          zoom: 1.1,
        },
        metadata: {
          dirty: true,
        },
      },
    });
    expect(snapshot.state.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "draft",
          position: { x: 120, y: 240 },
          expanded: true,
        }),
        expect.objectContaining({
          id: "review",
        }),
        expect.objectContaining({
          id: "workflow:brief:value",
          ref: expect.objectContaining({
            id: "brief",
            path: "brief",
          }),
        }),
      ])
    );
    expect(snapshot.state.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "brief-to-plan",
          source: "workflow",
          target: "draft",
        }),
        expect.objectContaining({
          id: "workflow-brief-to-draft",
          sourceRef: "brief",
          targetRef: "draft",
        }),
      ])
    );
  });

  it("restores a saved snapshot against the current workflow definition", () => {
    const original = graphWorkflowSnapshotOf(GraphWorkflowModel, {
      inputs: { brief: "Saved brief" },
      nodes: [
        {
          id: "legacy-draft-node",
          ref: { id: "draft" },
          position: { x: 10, y: 20 },
        },
      ],
      edges: [
        {
          id: "legacy-edge",
          source: "legacy-draft-node",
          sourceRef: "draft",
          target: "review",
          targetRef: "review",
        },
      ],
      ui: {
        selectedNodeIds: ["legacy-draft-node"],
      },
    });

    const restored = graphWorkflowSnapshotRestore(original, GraphWorkflowModel);

    expect(restored.definition).toMatchObject({
      name: "GraphWorkflowModel",
      tag: "graph-workflow",
      kind: "workflow",
    });
    expect(graphWorkflowSnapshotInputValuesOf(restored)).toEqual({
      brief: "Saved brief",
    });
    expect(graphWorkflowSnapshotOutputValuesOf(restored)).toEqual({
      approved: undefined,
    });
    expect(restored.state.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "legacy-draft-node",
          ref: expect.objectContaining({
            id: "draft",
          }),
        }),
      ])
    );
    expect(restored.state.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "legacy-edge",
          sourceRef: "draft",
          targetRef: "review",
        }),
      ])
    );
  });

  it("round-trips snapshots through JSON without losing graph state", () => {
    const snapshot = graphWorkflowSnapshotOf(GraphWorkflowModel, {
      inputs: { brief: "Round trip" },
      nodes: [
        {
          id: "draft",
          position: { x: 1, y: 2 },
        },
      ],
    });

    const json = graphWorkflowSnapshotToJSON(snapshot);
    const restored = graphWorkflowSnapshotFromJSON(json, GraphWorkflowModel);

    expect(restored.state.inputs).toEqual(snapshot.state.inputs);
    expect(restored.state.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "draft",
          position: { x: 1, y: 2 },
        }),
      ])
    );
    expect(restored.definition).toMatchObject(snapshot.definition);
  });
});
