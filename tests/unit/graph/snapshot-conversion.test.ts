/**
 * DECAF-50/P1 evidence: legacy snapshot conversion. Canonical documents are
 * executable semantics; editor.legacy keeps persisted data lossless;
 * constructor references are never carried into the canonical payload.
 */
import {
  GRAPH_WORKFLOW_SNAPSHOT_VERSION,
  graphWorkflowDocumentFromLegacySnapshot,
  graphWorkflowSnapshotFromLegacy,
  graphWorkflowSnapshotLikeToCanonical,
  graphWorkflowSnapshotToLegacy,
  isGraphJsonSafeValue,
  GraphWorkflowDocumentBuilder,
} from "../../../src/graph";
import type {
  GraphWorkflowDocument,
  GraphWorkflowSnapshot,
  LegacyGraphWorkflowSnapshot,
} from "../../../src/graph";

function cleanLegacySnapshot(): LegacyGraphWorkflowSnapshot {
  return {
    version: GRAPH_WORKFLOW_SNAPSHOT_VERSION,
    definition: {
      name: "Legacy Workflow",
      tag: "legacy-wf",
      kind: "core.workflow.legacy",
      labels: ["legacy"],
      inputs: [{ property: "in1", label: "In One", type: "string" } as never],
      outputs: [{ property: "out1", label: "Out One" } as never],
      nodes: [{ id: "n1", kind: "core.transform" } as never],
      relations: [
        { id: "rel0", source: "$workflow", sourcePort: "in1", target: "n1", targetPort: "value" },
        { id: "rel1", source: "legacy-wf", sourcePort: "out1", target: "n1", targetPort: "value" },
      ],
    },
    state: {
      inputs: [{ path: "in1", value: "seed" }],
      outputs: [{ path: "out1", value: null }],
      nodes: [
        {
          id: "n1",
          kind: "core.transform",
          label: "Transform",
          position: { x: 10, y: 20 },
          ports: {
            value: { mode: "port" },
            factor: { mode: "value", value: 3 },
          },
          data: { keep: "yes" },
          metadata: { stage: 1 },
        },
      ],
      edges: [
        { id: "e1", source: "$workflow", sourcePort: "in1", target: "n1", targetPort: "value", label: "seed" },
        { id: "e2", source: "workflow", sourcePort: "in1", target: "n1", targetPort: "factor" },
        { id: "e3", source: "graph", sourcePort: "in1", target: "legacy-wf", targetPort: "out1" },
      ],
      ui: {
        duplicateCounts: { n1: 2 },
        diagramMetadata: { viewport: { x: 5, y: 6, scale: 0.8 } },
      },
      metadata: { team: "core" },
    },
  };
}

function builderDocument(): GraphWorkflowDocument {
  return new GraphWorkflowDocumentBuilder("canon-doc", "Canonical Doc")
    .addInput({ id: "brief", schema: { type: "string" }, defaultValue: "b" })
    .addOutput({ id: "summary", schema: { type: "string" } })
    .addNode({
      id: "n1",
      kind: "core.transform",
      parameters: { value: "start" },
      ui: { position: { x: 1, y: 2 }, size: { width: 100, height: 40 } },
    })
    .addEdge({
      id: "re0",
      type: "data",
      source: { scope: "workflow", port: "brief" },
      target: { scope: "node", nodeId: "n1", port: "value" },
    })
    .addEdge({
      id: "re1",
      type: "connection",
      source: { scope: "node", nodeId: "n1", port: "modelRes" },
      target: { scope: "workflow", port: "summary" },
    })
    .build();
}

describe("legacy snapshot conversion", () => {
  const legacy = cleanLegacySnapshot();
  const canonical = graphWorkflowSnapshotFromLegacy(legacy);

  it("maps legacy boundary references to tagged scope endpoints", () => {
    const document = canonical.document;
    expect(document.id).toBe("legacy-wf");
    expect(document.name).toBe("Legacy Workflow");
    expect(document.edges.map((edge) => edge.source)).toEqual([
      { scope: "workflow", port: "in1" },
      { scope: "workflow", port: "in1" },
      { scope: "workflow", port: "in1" },
    ]);
    expect(document.edges[0].target).toEqual({ scope: "node", nodeId: "n1", port: "value" });
    expect(document.edges[2].target).toEqual({ scope: "workflow", port: "out1" });
  });

  it("carries port values, bindings, editor state and viewport across", () => {
    const document = canonical.document;
    expect(document.inputs[0].defaultValue).toBe("seed");
    expect(document.nodes[0].inputBindings).toEqual({
      value: { mode: "edge" },
      factor: { mode: "literal", value: 3 },
    });
    expect(document.nodes[0].ui).toEqual({
      position: { x: 10, y: 20 },
    });
    expect(document.ui).toEqual({ viewport: { x: 5, y: 6, zoom: 0.8 } });
    expect(canonical.editor?.duplicateCounts).toEqual({ n1: 2 });
    expect(canonical.editor?.nodePorts?.n1).toBeDefined();
    expect(canonical.metadata).toEqual({ team: "core" });
  });

  it("keeps the canonical payload JSON-safe and free of $workflow", () => {
    const json = JSON.stringify(canonical);
    expect(isGraphJsonSafeValue(JSON.parse(json))).toBe(true);
    expect(JSON.stringify(canonical.document)).not.toContain("$workflow");
    expect(JSON.stringify(canonical.document)).toContain('"scope":"workflow"');
  });

  it("strips constructor-reference keys from legacy node data", () => {
    const dirty = cleanLegacySnapshot();
    dirty.state.nodes[0].data = {
      legit: 1,
      node: class AnyNode {},
      modelClass: () => class Inner {},
      sourceClass: Object,
      constructor: () => undefined,
      definition: {},
      executor: { run: () => undefined },
      nested: { executor: () => undefined, kept: true },
      bad: NaN,
    };
    const converted = graphWorkflowSnapshotFromLegacy(dirty);
    expect(converted.document.nodes[0].parameters).toEqual({
      legit: 1,
      nested: { kept: true },
    });
    const legacyJson = JSON.stringify(converted.editor?.legacy);
    for (const forbidden of ["node", "modelClass", "sourceClass", "constructor", "definition", "executor"]) {
      const payload = converted.editor?.legacy as Record<string, Record<string, unknown>>;
      expect(Object.keys(payload["state"]["nodes"][0]["data"] as object)).not.toContain(forbidden);
    }
    expect(legacyJson).not.toMatch(/NaN/);
  });

  it("round-trips canonical→legacy→canonical losslessly for persisted data", () => {
    const back = graphWorkflowSnapshotToLegacy(canonical);
    expect(back).toEqual(legacy);
    const again = graphWorkflowSnapshotFromLegacy(back);
    expect(again.document).toEqual(canonical.document);
    expect(again.editor).toEqual(canonical.editor);
  });

  it("builds a best-effort legacy snapshot when no editor.legacy is present", () => {
    const snapshot: GraphWorkflowSnapshot = { document: builderDocument() };
    const legacyBack = graphWorkflowSnapshotToLegacy(snapshot);
    expect(legacyBack.version).toBe(1);
    expect(legacyBack.definition.tag).toBe("canon-doc");
    const boundaryEdge = legacyBack.state.edges.find((edge) => edge.id === "re0");
    expect(boundaryEdge?.source).toBe("$workflow");
    expect(boundaryEdge?.type).toBe("output");
    const connectionEdge = legacyBack.state.edges.find((edge) => edge.id === "re1");
    expect(connectionEdge?.type).toBe("connection");
    expect(legacyBack.state.nodes[0].data).toEqual({ value: "start" });
    expect(legacyBack.state.nodes[0].position).toEqual({ x: 1, y: 2 });
  });

  it("preserves node/edge/port semantics through the best-effort round trip", () => {
    const snapshot: GraphWorkflowSnapshot = { document: builderDocument() };
    const rebound = graphWorkflowDocumentFromLegacySnapshot(
      graphWorkflowSnapshotToLegacy(snapshot)
    );
    expect(rebound.id).toBe("canon-doc");
    expect(rebound.name).toBe("Canonical Doc");
    expect(rebound.nodes.map((node) => [node.id, node.kind, node.parameters])).toEqual([
      ["n1", "core.transform", { value: "start" }],
    ]);
    expect(rebound.edges.map((edge) => [edge.id, edge.source, edge.target])).toEqual([
      ["re0", { scope: "workflow", port: "brief" }, { scope: "node", nodeId: "n1", port: "value" }],
      ["re1", { scope: "node", nodeId: "n1", port: "modelRes" }, { scope: "workflow", port: "summary" }],
    ]);
    expect(rebound.nodes[0].ui).toEqual({
      position: { x: 1, y: 2 },
      size: { width: 100, height: 40 },
    });
  });

  it("normalizes any accepted snapshot-like value to the canonical wrapper", () => {
    const document = builderDocument();
    expect(graphWorkflowSnapshotLikeToCanonical(document)).toEqual({ document });
    const legacyBack = graphWorkflowSnapshotToLegacy({ document });
    const wrapped = graphWorkflowSnapshotLikeToCanonical(legacyBack);
    expect("document" in wrapped).toBe(true);
    expect(wrapped.document.id).toBe("canon-doc");
    const canonicalWrapper: GraphWorkflowSnapshot = { document };
    expect(graphWorkflowSnapshotLikeToCanonical(canonicalWrapper)).toBe(canonicalWrapper);
  });
});
