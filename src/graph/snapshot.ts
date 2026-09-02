import { Constructor } from "@decaf-ts/decoration";
import { Model } from "@decaf-ts/decorator-validation";
import {
  GraphPortDefinition,
  GraphWorkflowDefinition,
  GraphWorkflowMetadata,
  GraphWorkflowNodeMetadata,
  GraphWorkflowRelationMetadata,
} from "./constants";
import { graphLeafPortsOf, graphWorkflowDefinitionOf } from "./reader";
import type {
  GraphWorkflowDocument,
  GraphWorkflowPortInstance,
} from "./document/GraphWorkflowDocument";
import type { GraphNodeInstance } from "./document/GraphNodeInstance";
import type { GraphEdgeInstance } from "./document/GraphEdgeInstance";
import type {
  GraphEndpoint,
  GraphWorkflowEndpoint,
} from "./document/GraphEndpoint";
import type { GraphInputBinding } from "./document/GraphNodeBinding";
import type { GraphJsonValue } from "./document/GraphJsonValue";
import { isGraphJsonSafeValue } from "./document/GraphJsonValue";
import type { GraphNodeUiState, GraphWorkflowUiState } from "./document/GraphWorkflowUiState";
import {
  graphValueSchemaFromValidation,
  type GraphValidationRecord,
} from "./catalog/GraphValueSchemaDerivation";

const GRAPH_LEGACY_BOUNDARY_ALIASES = ["$workflow", "workflow", "graph"];

const GRAPH_CONSTRUCTOR_DATA_KEYS = [
  "node",
  "modelClass",
  "sourceClass",
  "constructor",
  "definition",
  "executor",
];

type GraphModelLike<M extends Model = Model> = Constructor<M> | M;

export const GRAPH_WORKFLOW_SNAPSHOT_VERSION = 1 as const;

export type GraphWorkflowSnapshotReference = {
  id?: string;
  kind?: string;
  tag?: string;
  path?: string;
  property?: string;
};

export type GraphWorkflowSnapshotPosition = {
  x: number;
  y: number;
};

export type GraphWorkflowSnapshotSize = {
  width?: number;
  height?: number;
};

export type GraphWorkflowSnapshotPortState = {
  expanded?: boolean;
  value?: unknown;
  mode?: "port" | "value";
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowSnapshotValue = {
  path: string;
  value?: unknown;
  label?: string;
  type?: string;
  required?: boolean;
  model?: string;
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowSnapshotNode = {
  id: string;
  ref?: GraphWorkflowSnapshotReference;
  label?: string;
  kind?: string;
  position?: GraphWorkflowSnapshotPosition;
  size?: GraphWorkflowSnapshotSize;
  expanded?: boolean;
  ports?: Record<string, GraphWorkflowSnapshotPortState>;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowSnapshotEdge = {
  id: string;
  source: string;
  sourceRef?: string;
  sourcePort?: string;
  target: string;
  targetRef?: string;
  targetPort?: string;
  label?: string;
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowSnapshotDefinition = {
  name: string;
  tag: string;
  kind: string;
  category?: string;
  color?: string;
  group?: string;
  height?: number;
  icon?: string;
  labels: string[];
  maxChildren?: number;
  minWidth?: number;
  width?: number;
  metadata?: GraphWorkflowMetadata;
  inputs: GraphPortDefinition[];
  outputs: GraphPortDefinition[];
  nodes: GraphWorkflowNodeMetadata[];
  relations: GraphWorkflowRelationMetadata[];
};

export type GraphWorkflowSnapshotState = {
  inputs: GraphWorkflowSnapshotValue[];
  outputs: GraphWorkflowSnapshotValue[];
  nodes: GraphWorkflowSnapshotNode[];
  edges: GraphWorkflowSnapshotEdge[];
  ui: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

/** Snapshot schema version literal type ({@link GRAPH_WORKFLOW_SNAPSHOT_VERSION}). */
export type GraphWorkflowSnapshotVersion = typeof GRAPH_WORKFLOW_SNAPSHOT_VERSION;

/**
 * Legacy persisted snapshot (`{ version, definition, state }`). Kept only for
 * loading/compatibility of persisted data; the canonical snapshot is
 * {@link GraphWorkflowSnapshot} (`{ document, editor?, metadata? }`).
 * Convert with {@link graphWorkflowSnapshotFromLegacy} /
 * {@link graphWorkflowSnapshotToLegacy}.
 */
export type LegacyGraphWorkflowSnapshot = {
  version: GraphWorkflowSnapshotVersion;
  definition: GraphWorkflowSnapshotDefinition;
  state: GraphWorkflowSnapshotState;
};

export type GraphWorkflowSnapshotInput = {
  definition?: Partial<GraphWorkflowSnapshotDefinition>;
  inputs?: GraphWorkflowSnapshotValue[] | Record<string, unknown>;
  outputs?: GraphWorkflowSnapshotValue[] | Record<string, unknown>;
  nodes?: GraphWorkflowSnapshotNode[];
  edges?: GraphWorkflowSnapshotEdge[];
  ui?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (isPlainObject(value)) {
    const cloned: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      cloned[key] = cloneValue(entry);
    }
    return cloned as T;
  }

  return value;
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : String(value);
}

function isWorkflowDefinitionLike(
  value: unknown
): value is GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition {
  return (
    isPlainObject(value) &&
    typeof value.name === "string" &&
    typeof value.tag === "string" &&
    typeof value.kind === "string" &&
    Array.isArray(value.inputs) &&
    Array.isArray(value.outputs) &&
    Array.isArray(value.nodes) &&
    Array.isArray(value.relations)
  );
}

function snapshotNodeKey(node: Partial<GraphWorkflowSnapshotNode>): string | undefined {
  return node.ref?.id ?? node.id ?? node.ref?.path ?? node.ref?.property;
}

function snapshotEdgeKey(edge: Partial<GraphWorkflowSnapshotEdge>): string | undefined {
  return (
    edge.id ??
    [edge.sourceRef ?? edge.source, edge.sourcePort, edge.targetRef ?? edge.target, edge.targetPort]
      .filter(Boolean)
      .join("::")
  );
}

function normalizeValueEntries(
  entries: GraphWorkflowSnapshotValue[] | Record<string, unknown> | undefined,
  definitions: GraphPortDefinition[]
): GraphWorkflowSnapshotValue[] {
  const byPath = new Map<string, GraphWorkflowSnapshotValue>();

  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (!entry?.path) continue;
      byPath.set(entry.path, cloneValue(entry));
    }
  } else if (isPlainObject(entries)) {
    for (const [path, value] of Object.entries(entries)) {
      byPath.set(path, { path, value: cloneValue(value) });
    }
  }

  const normalized: GraphWorkflowSnapshotValue[] = definitions.map((definition) => {
    const path = definition.path ?? definition.property;
    const current = byPath.get(path);
    const entry: GraphWorkflowSnapshotValue = {
      label: definition.label,
      type: definition.type,
      required: definition.required,
      model: definition.model,
      metadata: cloneValue(
        definition.graph?.metadata ??
          definition.element?.props ??
          definition.prop?.props ??
          {}
      ),
      ...current,
      path,
    };

    if (!Object.keys(entry.metadata || {}).length) {
      delete entry.metadata;
    }
    return entry;
  });

  for (const entry of byPath.values()) {
    if (normalized.some((current) => current.path === entry.path)) continue;
    normalized.push(cloneValue(entry));
  }

  return normalized;
}

function normalizeNodes(
  nodes: GraphWorkflowSnapshotNode[] | undefined,
  definitions: GraphWorkflowNodeMetadata[]
): GraphWorkflowSnapshotNode[] {
  const byKey = new Map<string, GraphWorkflowSnapshotNode>();
  const result: GraphWorkflowSnapshotNode[] = [];

  for (const definition of definitions) {
    const node: GraphWorkflowSnapshotNode = {
      id: definition.id,
      ref: {
        id: definition.id,
        kind: definition.kind,
      },
      label: definition.label,
      kind: definition.kind,
      data: definition.node !== undefined ? { node: cloneValue(definition.node) } : undefined,
      metadata: cloneValue(definition.metadata),
    };
    result.push(node);
    byKey.set(definition.id, node);
  }

  for (const entry of nodes || []) {
    const key = snapshotNodeKey(entry);
    const current = key ? byKey.get(key) : undefined;
    if (current) {
      const merged: GraphWorkflowSnapshotNode = {
        ...current,
        ...cloneValue(entry),
        id: entry.id || current.id,
        ref: {
          ...current.ref,
          ...entry.ref,
          id: entry.ref?.id ?? current.ref?.id ?? current.id,
        },
        position: entry.position ? cloneValue(entry.position) : current.position,
        size: entry.size ? cloneValue(entry.size) : current.size,
        ports: {
          ...(current.ports || {}),
          ...(entry.ports || {}),
        },
        data: {
          ...(current.data || {}),
          ...(entry.data || {}),
        },
        metadata: {
          ...(current.metadata || {}),
          ...(entry.metadata || {}),
        },
      };
      if (key) byKey.set(key, merged);
      const index = result.findIndex((value) => value.id === current.id);
      if (index >= 0) result[index] = merged;
      continue;
    }

    const cloned = cloneValue(entry);
    result.push(cloned);
    if (key) byKey.set(key, cloned);
  }

  return result;
}

function normalizeEdges(
  edges: GraphWorkflowSnapshotEdge[] | undefined,
  relations: GraphWorkflowRelationMetadata[]
): GraphWorkflowSnapshotEdge[] {
  const byKey = new Map<string, GraphWorkflowSnapshotEdge>();
  const result: GraphWorkflowSnapshotEdge[] = [];

  for (const [index, relation] of relations.entries()) {
    const source = asString(relation.source) ?? `source-${index}`;
    const target = asString(relation.target) ?? `target-${index}`;
    const edge: GraphWorkflowSnapshotEdge = {
      id: relation.label || `${source}:${relation.sourcePort ?? "*"}->${target}:${relation.targetPort ?? "*"}`,
      source,
      sourceRef: source,
      sourcePort: relation.sourcePort,
      target,
      targetRef: target,
      targetPort: relation.targetPort,
      label: relation.label,
      metadata: cloneValue(relation.metadata),
    };
    result.push(edge);
    byKey.set(edge.id, edge);
  }

  for (const entry of edges || []) {
    const key = snapshotEdgeKey(entry);
    const current = key ? byKey.get(key) : undefined;
    if (current) {
      const merged: GraphWorkflowSnapshotEdge = {
        ...current,
        ...cloneValue(entry),
        id: entry.id || current.id,
        source: entry.source || current.source,
        sourceRef: entry.sourceRef ?? current.sourceRef ?? entry.source ?? current.source,
        target: entry.target || current.target,
        targetRef: entry.targetRef ?? current.targetRef ?? entry.target ?? current.target,
        // Labels are document-carried display semantics (§4.4.7): a row merged
        // from a canvas clone that never carried its own label must not erase
        // the relation row's label.
        label: entry.label ?? current.label,
        metadata: {
          ...(current.metadata || {}),
          ...(entry.metadata || {}),
        },
      };
      if (key) byKey.set(key, merged);
      const index = result.findIndex((value) => value.id === current.id);
      if (index >= 0) result[index] = merged;
      continue;
    }

    const cloned = cloneValue(entry);
    result.push(cloned);
    if (key) byKey.set(key, cloned);
  }

  return result;
}

function normalizeWorkflowDefinition(
  definition: GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition,
  overrides: Partial<GraphWorkflowSnapshotDefinition> = {}
): GraphWorkflowSnapshotDefinition {
  return {
    name: overrides.name ?? definition.name,
    tag: overrides.tag ?? definition.tag,
    kind: overrides.kind ?? definition.kind,
    category: overrides.category ?? definition.category,
    color: overrides.color ?? definition.color,
    group: overrides.group ?? definition.group,
    height: overrides.height ?? definition.height,
    icon: overrides.icon ?? definition.icon,
    labels: cloneValue(overrides.labels ?? definition.labels ?? []),
    maxChildren: overrides.maxChildren ?? definition.maxChildren,
    minWidth: overrides.minWidth ?? definition.minWidth,
    width: overrides.width ?? definition.width,
    metadata: cloneValue(
      overrides.metadata ??
        ("workflow" in definition ? definition.workflow : definition.metadata)
    ),
    inputs: cloneValue(overrides.inputs ?? definition.inputs ?? []),
    outputs: cloneValue(overrides.outputs ?? definition.outputs ?? []),
    nodes: cloneValue(overrides.nodes ?? definition.nodes ?? []),
    relations: cloneValue(overrides.relations ?? definition.relations ?? []),
  };
}

export function graphWorkflowSnapshotDefinitionOf<M extends Model>(
  model: GraphModelLike<M> | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition
): GraphWorkflowSnapshotDefinition {
  const definition = isWorkflowDefinitionLike(model)
    ? model
    : graphWorkflowDefinitionOf(model as GraphModelLike<M>);
  return normalizeWorkflowDefinition(definition);
}

export function graphWorkflowSnapshotOf<M extends Model>(
  model: GraphModelLike<M> | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition,
  input?: GraphWorkflowSnapshotInput
): LegacyGraphWorkflowSnapshot {
  const normalizedDefinition = normalizeWorkflowDefinition(
    graphWorkflowSnapshotDefinitionOf(model as any),
    input?.definition
  );
  const inputPorts = graphLeafPortsOf(normalizedDefinition.inputs);
  const outputPorts = graphLeafPortsOf(normalizedDefinition.outputs);

  return {
    version: GRAPH_WORKFLOW_SNAPSHOT_VERSION,
    definition: normalizedDefinition,
    state: {
      inputs: normalizeValueEntries(input?.inputs, inputPorts),
      outputs: normalizeValueEntries(input?.outputs, outputPorts),
      nodes: normalizeNodes(input?.nodes, normalizedDefinition.nodes),
      edges: normalizeEdges(input?.edges, normalizedDefinition.relations),
      ui: cloneValue(input?.ui || {}),
      metadata: cloneValue(input?.metadata || {}),
    },
  };
}

export function graphWorkflowSnapshotRestore<M extends Model>(
  snapshot: LegacyGraphWorkflowSnapshot | GraphWorkflowSnapshotInput,
  model?: GraphModelLike<M> | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition
): LegacyGraphWorkflowSnapshot {
  if (!("version" in snapshot)) {
    return graphWorkflowSnapshotOf(
      model ??
        (snapshot.definition as
          | GraphWorkflowDefinition
          | GraphWorkflowSnapshotDefinition
          | undefined) ??
        ({} as GraphWorkflowDefinition),
      snapshot
    );
  }

  const fullSnapshot = snapshot as LegacyGraphWorkflowSnapshot;
  const definition = model
    ? graphWorkflowSnapshotDefinitionOf(model)
    : fullSnapshot.definition;

  return graphWorkflowSnapshotOf(definition, {
    inputs: fullSnapshot.state.inputs,
    outputs: fullSnapshot.state.outputs,
    nodes: fullSnapshot.state.nodes,
    edges: fullSnapshot.state.edges,
    ui: fullSnapshot.state.ui,
    metadata: fullSnapshot.state.metadata,
  });
}

export function graphWorkflowSnapshotToJSON(
  snapshot: LegacyGraphWorkflowSnapshot,
  space?: number
): string {
  return JSON.stringify(snapshot, undefined, space);
}

export function graphWorkflowSnapshotFromJSON(
  input: string | LegacyGraphWorkflowSnapshot,
  model?: GraphModelLike | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition
): LegacyGraphWorkflowSnapshot {
  const snapshot =
    typeof input === "string" ? (JSON.parse(input) as LegacyGraphWorkflowSnapshot) : input;
  return graphWorkflowSnapshotRestore(snapshot, model);
}

export function graphWorkflowSnapshotInputValuesOf(
  snapshot: LegacyGraphWorkflowSnapshot
): Record<string, unknown> {
  return Object.fromEntries(
    snapshot.state.inputs.map((entry) => [entry.path, cloneValue(entry.value)])
  );
}

export function graphWorkflowSnapshotOutputValuesOf(
  snapshot: LegacyGraphWorkflowSnapshot
): Record<string, unknown> {
  return Object.fromEntries(
    snapshot.state.outputs.map((entry) => [entry.path, cloneValue(entry.value)])
  );
}

/**
 * Editor-only state that the canonical {@link GraphWorkflowDocument} cannot
 * express (layout beyond node positions, config-store values, per-port modes,
 * workflow boundary values, and duplicate counts). Stored as JSON-safe values
 * only; constructors and `modelClass`/`sourceClass` references are dropped.
 */
export type GraphSnapshotEditorState = {
  viewport?: { x: number; y: number; scale: number };
  duplicateCounts?: Record<string, number>;
  boundaryInputValues?: Record<string, GraphJsonValue>;
  boundaryOutputValues?: Record<string, GraphJsonValue>;
  nodePorts?: Record<string, Record<string, GraphJsonValue>>;
  nodeConfigs?: Record<string, GraphJsonValue>;
  diagramMetadata?: Record<string, GraphJsonValue>;
  definitionDisplay?: Record<string, GraphJsonValue>;
  legacy?: GraphJsonValue;
} & { [key: string]: GraphJsonValue | undefined };

/**
 * Canonical document-first snapshot. `document` is the executable semantic
 * truth; `editor` preserves legacy editor-only state for lossless round trips.
 */
export type GraphWorkflowSnapshot = {
  document: GraphWorkflowDocument;
  editor?: GraphSnapshotEditorState;
  metadata?: Record<string, GraphJsonValue>;
};

export type GraphWorkflowSnapshotLike =
  | LegacyGraphWorkflowSnapshot
  | GraphWorkflowSnapshot;

function dropUnsafeEntries(
  source: Record<string, unknown>
): Record<string, GraphJsonValue> {
  const result: Record<string, GraphJsonValue> = {};
  for (const [key, value] of Object.entries(source)) {
    if (GRAPH_CONSTRUCTOR_DATA_KEYS.includes(key)) continue;
    const sanitized = sanitizeToGraphJsonValue(value);
    if (sanitized !== undefined) result[key] = sanitized;
  }
  return result;
}

/**
 * Sanitizes a legacy snapshot into a JSON-safe payload while preserving its
 * structural keys (`version`, `definition`, `state`). Constructor-key stripping
 * still applies to the payload contents inside, so the canonical→legacy
 * round trip stays lossless for persisted data.
 */
function sanitizeLegacySnapshotPayload(
  snapshot: LegacyGraphWorkflowSnapshot
): GraphJsonValue {
  return {
    version: snapshot.version,
    definition: dropUnsafeEntries(
      (snapshot.definition ?? {}) as unknown as Record<string, unknown>
    ),
    state: dropUnsafeEntries(
      (snapshot.state ?? {}) as unknown as Record<string, unknown>
    ),
  };
}

function sanitizeToGraphJsonValue(value: unknown): GraphJsonValue | undefined {
  if (value === null) return null;
  const type = typeof value;
  if (type === "string" || type === "boolean") return value as GraphJsonValue;
  if (type === "number") return Number.isFinite(value as number) ? (value as number) : undefined;
  if (Array.isArray(value)) {
    const items: GraphJsonValue[] = [];
    for (const item of value) {
      const sanitized = sanitizeToGraphJsonValue(item);
      if (sanitized !== undefined) items.push(sanitized);
    }
    return items;
  }
  if (type === "object") {
    return dropUnsafeEntries(value as Record<string, unknown>);
  }
  return undefined;
}

function boundaryAliasesFor(definition: GraphWorkflowSnapshotDefinition): Set<string> {
  const aliases = new Set<string>(GRAPH_LEGACY_BOUNDARY_ALIASES);
  if (definition.tag) aliases.add(definition.tag);
  if (definition.name) aliases.add(definition.name);
  return aliases;
}

function legacyEndpoint(
  refId: string | undefined,
  port: string | undefined,
  aliases: Set<string>,
  boundaryPortIds?: ReadonlyMap<string, string>
): GraphEndpoint {
  const resolvedPort = port ?? "";
  if (!refId || aliases.has(refId)) {
    return { scope: "workflow", port: resolvedPort } satisfies GraphWorkflowEndpoint;
  }
  // The legacy decorated-root canvas rendered workflow input ports as draggable
  // boundary badges (`input-{port}`, port handle `value`). Those bindings stay
  // lossless only when the badge id folds back onto the workflow port it was
  // drawn for (DECAF-50 §4.11); otherwise a workflow port would collapse into
  // one shared boundary endpoint and drop real edges (§4.4.6 canonical form).
  if (refId.startsWith("input-")) {
    const workflowPortId = boundaryPortIds?.get(refId.slice("input-".length) ?? "");
    if (workflowPortId) {
      return {
        scope: "workflow",
        port: workflowPortId,
      } satisfies GraphWorkflowEndpoint;
    }
  }
  return { scope: "node", nodeId: refId, port: resolvedPort } satisfies GraphEndpoint;
}

/**
 * Maps workflow input-property names to their legacy boundary-badge ids
 * (`input-{property}`), so badges drawn on the canvas resolve back to the
 * workflow port they represent (§4.11).
 */
function boundaryPortIdsFor(snapshot: LegacyGraphWorkflowSnapshot): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const port of snapshot.definition.inputs) {
    map.set(`input-${port.property}`, port.property);
  }
  return map;
}

/**
 * Resolves the decorated definition's own edge labels by canonical endpoint
 * pair, so converted legacy edges that never carried a label on the edge row
 * (canvas-drawn clones merged over the relation rows) still restore the
 * document-carried {@link GraphEdgeInstance.label} (§4.4.7) instead of losing
 * the display affordance on save/reload.
 */
function legacyRelationLabelByEndpoint(
  snapshot: LegacyGraphWorkflowSnapshot,
  aliases: Set<string>,
  boundaryPortIds: ReadonlyMap<string, string>
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const relation of snapshot.definition.relations) {
    const label = typeof relation.label === "string" ? relation.label : undefined;
    if (!label) continue;
    const sourceRef = typeof relation.source === "string" ? relation.source : undefined;
    const targetRef = typeof relation.target === "string" ? relation.target : undefined;
    map.set(
      edgePairKeyOf({
        source: legacyEndpoint(sourceRef, relation.sourcePort, aliases, boundaryPortIds),
        target: legacyEndpoint(targetRef, relation.targetPort, aliases, boundaryPortIds),
      }),
      label
    );
  }
  return map;
}

function endpointToLegacyRef(endpoint: GraphEndpoint): { refId: string; port: string } {
  if (endpoint.scope === "workflow") {
    return { refId: "$workflow", port: endpoint.port };
  }
  return { refId: endpoint.nodeId, port: endpoint.port };
}

function portInstanceFromDefinition(
  port: GraphPortDefinition,
  value?: GraphJsonValue
): GraphWorkflowPortInstance {
  const instance: GraphWorkflowPortInstance = {
    id: port.property,
    label: port.label,
  };
  instance.schema = graphValueSchemaFromValidation(
    port.validation as GraphValidationRecord | undefined,
    port.type,
    port.model
  );
  if (port.required) instance.required = true;
  if (value !== undefined) instance.defaultValue = value;
  const metadata = sanitizeToGraphJsonValue(port.graph ?? {}) as Record<string, GraphJsonValue> | undefined;
  if (metadata && Object.keys(metadata).length) instance.metadata = metadata;
  return instance;
}

function inputBindingsFromPorts(
  ports: Record<string, GraphWorkflowSnapshotPortState> | undefined
): Record<string, GraphInputBinding> | undefined {
  if (!ports) return undefined;
  const bindings: Record<string, GraphInputBinding> = {};
  for (const [property, port] of Object.entries(ports)) {
    if (port?.mode === "port") {
      bindings[property] = { mode: "edge" };
    } else if ("value" in (port ?? {})) {
      const value = sanitizeToGraphJsonValue(port.value);
      bindings[property] = { mode: "literal", value: value ?? null };
    }
  }
  return Object.keys(bindings).length ? bindings : undefined;
}

function nodeInstanceFromLegacy(node: GraphWorkflowSnapshotNode): GraphNodeInstance {
  const instance: GraphNodeInstance = {
    id: node.id,
    kind: node.kind ?? node.ref?.kind ?? node.id,
    parameters: dropUnsafeEntries(node.data ?? {}),
  };
  if (node.label) instance.label = node.label;
  const bindings = inputBindingsFromPorts(node.ports);
  if (bindings) instance.inputBindings = bindings;
  const metadata = sanitizeToGraphJsonValue(node.metadata ?? {}) as Record<string, GraphJsonValue> | undefined;
  if (metadata && Object.keys(metadata).length) instance.metadata = metadata;
  if (node.position || node.size || node.expanded !== undefined) {
    const ui: GraphNodeUiState = {
      position: node.position ? { x: node.position.x, y: node.position.y } : { x: 0, y: 0 },
    };
    if (node.size) ui.size = { width: node.size.width, height: node.size.height };
    if (node.expanded !== undefined) ui.expanded = node.expanded;
    instance.ui = ui;
  }
  return instance;
}

function edgeInstanceFromLegacy(
  edge: GraphWorkflowSnapshotEdge,
  aliases: Set<string>,
  boundaryPortIds?: ReadonlyMap<string, string>,
  relationLabelByPair?: ReadonlyMap<string, string>
): GraphEdgeInstance {
  const source = legacyEndpoint(
    edge.sourceRef ?? edge.source,
    edge.sourcePort,
    aliases,
    boundaryPortIds
  );
  const target = legacyEndpoint(
    edge.targetRef ?? edge.target,
    edge.targetPort,
    aliases,
    boundaryPortIds
  );
  const instance: GraphEdgeInstance = {
    id: edge.id,
    type: "data",
    source,
    target,
  };
  const label = edge.label ?? relationLabelByPair?.get(edgePairKeyOf({ source, target }));
  if (label) instance.label = label;
  const metadata = sanitizeToGraphJsonValue(edge.metadata ?? {}) as Record<string, GraphJsonValue> | undefined;
  if (metadata && Object.keys(metadata).length) instance.metadata = metadata;
  return instance;
}

/** Endpoint-pair key for edge identity (canonical `GraphEndpoint` shape). */
function edgePairKeyOf(edge: { source: GraphEndpoint; target: GraphEndpoint }): string {
  const keyOf = (endpoint: GraphEndpoint): string =>
    endpoint.scope === "node"
      ? `node:${endpoint.nodeId}:${endpoint.port}`
      : `workflow:${endpoint.port}`;
  return `${keyOf(edge.source)}->${keyOf(edge.target)}`;
}

/**
 * Maps a legacy (pre-P7) canvas snapshot to the canonical
 * {@link GraphWorkflowDocument} (DECAF-50 §4.4.6): legacy `node.data` becomes
 * instance `parameters`, legacy `node.metadata` becomes instance `metadata`,
 * workflow boundary badges (`input-{port}`) fold back onto their workflow
 * ports, and edge labels missing from cloned edge rows are restored from the
 * decorated definition's relation labels (§4.4.7).
 */
export function graphWorkflowDocumentFromLegacySnapshot(
  snapshot: LegacyGraphWorkflowSnapshot
): GraphWorkflowDocument {
  const aliases = boundaryAliasesFor(snapshot.definition);
  const boundaryPortIds = boundaryPortIdsFor(snapshot);
  const relationLabelByPair = legacyRelationLabelByEndpoint(snapshot, aliases, boundaryPortIds);
  const inputs = Object.fromEntries(
    snapshot.state.inputs.map((entry) => [entry.path, sanitizeToGraphJsonValue(entry.value)])
  );
  const outputs = Object.fromEntries(
    snapshot.state.outputs.map((entry) => [entry.path, sanitizeToGraphJsonValue(entry.value)])
  );
  const document: GraphWorkflowDocument = {
    id: snapshot.definition.tag || snapshot.definition.name,
    name: snapshot.definition.name,
    inputs: snapshot.definition.inputs.map((port) =>
      portInstanceFromDefinition(port, inputs[port.property])
    ),
    outputs: snapshot.definition.outputs.map((port) =>
      portInstanceFromDefinition(port, outputs[port.property])
    ),
    nodes: snapshot.state.nodes.map(nodeInstanceFromLegacy),
    edges: snapshot.state.edges.map((edge) =>
      edgeInstanceFromLegacy(edge, aliases, boundaryPortIds, relationLabelByPair)
    ),
  };
  if (snapshot.definition.metadata) {
    const metadata = sanitizeToGraphJsonValue(
      snapshot.definition.metadata
    ) as Record<string, GraphJsonValue> | undefined;
    if (metadata && Object.keys(metadata).length) document.metadata = metadata;
  }
  const ui: GraphWorkflowUiState = {};
  const viewport = snapshot.state.ui?.["diagramMetadata"] as
    | Record<string, unknown>
    | undefined;
  const parsedViewport = viewport?.["viewport"];
  if (parsedViewport && typeof parsedViewport === "object") {
    const v = parsedViewport as Record<string, unknown>;
    const x = typeof v["x"] === "number" ? v["x"] : Number(v["x"]) || 0;
    const y = typeof v["y"] === "number" ? v["y"] : Number(v["y"]) || 0;
    const zoom = typeof v["scale"] === "number" ? v["scale"] : Number(v["scale"]) || 1;
    ui.viewport = { x, y, zoom };
  }
  if (ui.viewport) document.ui = ui;
  return document;
}

/**
 * Converts a legacy persisted snapshot into the canonical wrapper. The canonical
 * `document` carries executable semantics; `editor.legacy` keeps the sanitized
 * (constructor-free) legacy payload so a canonical→legacy round trip is lossless
 * for persisted data.
 */
export function graphWorkflowSnapshotFromLegacy(
  snapshot: LegacyGraphWorkflowSnapshot
): GraphWorkflowSnapshot {
  const document = graphWorkflowDocumentFromLegacySnapshot(snapshot);
  const editor: GraphSnapshotEditorState = {};
  const sanitizedLegacy = sanitizeLegacySnapshotPayload(snapshot);
  if (sanitizedLegacy && isGraphJsonSafeValue(sanitizedLegacy)) editor.legacy = sanitizedLegacy;
  const ui = snapshot.state.ui;
  if (ui) {
    const duplicateCounts = ui["duplicateCounts"];
    if (duplicateCounts && typeof duplicateCounts === "object") {
      editor.duplicateCounts = duplicateCounts as Record<string, number>;
    }
    const diagramMetadata = ui["diagramMetadata"];
    if (diagramMetadata && typeof diagramMetadata === "object") {
      editor.diagramMetadata = sanitizeToGraphJsonValue(
        diagramMetadata as Record<string, unknown>
      ) as Record<string, GraphJsonValue>;
    }
    const nodeConfigs = ui["nodeConfigs"];
    if (nodeConfigs && typeof nodeConfigs === "object") {
      editor.nodeConfigs = sanitizeToGraphJsonValue(
        nodeConfigs as Record<string, unknown>
      ) as Record<string, GraphJsonValue>;
    }
  }
  editor.nodePorts = {};
  for (const node of snapshot.state.nodes) {
    if (node.ports) {
      editor.nodePorts[node.id] = sanitizeToGraphJsonValue(
        node.ports as unknown as Record<string, unknown>
      ) as Record<string, GraphJsonValue>;
    }
  }
  if (!Object.keys(editor.nodePorts).length) delete editor.nodePorts;
  const definitionDisplay = dropUnsafeEntries(
    snapshot.definition as unknown as Record<string, unknown>
  );
  delete definitionDisplay["inputs"];
  delete definitionDisplay["outputs"];
  delete definitionDisplay["nodes"];
  delete definitionDisplay["relations"];
  editor.definitionDisplay = definitionDisplay;
  const metadata = sanitizeToGraphJsonValue(
    snapshot.state.metadata ?? {}
  ) as Record<string, GraphJsonValue>;
  return { document, editor, metadata: Object.keys(metadata).length ? metadata : undefined };
}

/**
 * Reconstructs a legacy snapshot from a canonical wrapper. Uses the
 * `editor.legacy` payload when present for exact round trips; otherwise it
 * rebuilds a best-effort legacy snapshot from the document + editor state
 * (constructors are never restored).
 */
export function graphWorkflowSnapshotToLegacy(
  snapshot: GraphWorkflowSnapshot
): LegacyGraphWorkflowSnapshot {
  if (snapshot.editor?.legacy && isGraphJsonSafeValue(snapshot.editor.legacy)) {
    return cloneValue(snapshot.editor.legacy) as unknown as LegacyGraphWorkflowSnapshot;
  }
  const { document, editor } = snapshot;
  const aliases = new Set<string>(GRAPH_LEGACY_BOUNDARY_ALIASES);
  if (document.id) aliases.add(document.id);
  if (document.name) aliases.add(document.name);
  const display = (editor?.definitionDisplay ?? {}) as Record<string, unknown>;
  const definition = {
    ...cloneValue(display),
    name: document.name,
    tag: document.id || (display["tag"] as string | undefined) || document.name,
    inputs: document.inputs.map((port) => portToLegacyDefinition(port)),
    outputs: document.outputs.map((port) => portToLegacyDefinition(port)),
    nodes: document.nodes.map((node) => ({ id: node.id, kind: node.kind })),
    relations: document.edges.map((edge) => ({
      id: edge.id,
      source: endpointToLegacyRef(edge.source).refId,
      sourcePort: edge.source.port,
      target: endpointToLegacyRef(edge.target).refId,
      targetPort: edge.target.port,
      label: edge.label,
    })),
  } as unknown as LegacyGraphWorkflowSnapshot["definition"];

  const state: LegacyGraphWorkflowSnapshot["state"] = {
    inputs: document.inputs.map((port) => ({
      path: port.id,
      value: cloneValue(port.defaultValue) as never,
      label: port.label,
      required: port.required,
    })),
    outputs: document.outputs.map((port) => ({
      path: port.id,
      value: cloneValue(port.defaultValue) as never,
      label: port.label,
      required: port.required,
    })),
    nodes: document.nodes.map((node) => ({
      id: node.id,
      ref: { id: node.id, kind: node.kind },
      label: node.label,
      kind: node.kind,
      position: node.ui?.position ? { x: node.ui.position.x, y: node.ui.position.y } : undefined,
      size: node.ui?.size ? { width: node.ui.size.width, height: node.ui.size.height } : undefined,
      expanded: node.ui?.expanded,
      ports: (editor?.nodePorts?.[node.id] as never) ?? undefined,
      data: cloneValue(node.parameters ?? {}) as never,
      metadata: cloneValue(node.metadata ?? {}) as never,
    })),
    edges: document.edges.map((edge) => {
      const source = endpointToLegacyRef(edge.source);
      const target = endpointToLegacyRef(edge.target);
      const isBoundary = source.refId === "$workflow" || target.refId === "$workflow";
      const isConnection = edge.type === "connection";
      return {
        id: edge.id,
        source: source.refId,
        sourceRef: source.refId,
        sourcePort: source.port,
        target: target.refId,
        targetRef: target.refId,
        targetPort: target.port,
        label: edge.label,
        type: isConnection ? "connection" : isBoundary ? "output" : "data",
        metadata: cloneValue(edge.metadata ?? {}) as never,
      } as never;
    }),
    ui: cloneValue({
      ...(editor?.duplicateCounts ? { duplicateCounts: editor.duplicateCounts } : {}),
      ...(editor?.diagramMetadata ? { diagramMetadata: editor.diagramMetadata } : {}),
      ...(editor?.nodeConfigs ? { nodeConfigs: editor.nodeConfigs } : {}),
    }) as never,
    metadata: cloneValue(snapshot.metadata ?? {}) as never,
  };
  return {
    version: GRAPH_WORKFLOW_SNAPSHOT_VERSION,
    definition,
    state,
  };
}

function portToLegacyDefinition(port: GraphWorkflowPortInstance): GraphPortDefinition {
  return {
    property: port.id,
    label: port.label,
    required: port.required,
    metadata: cloneValue(port.metadata ?? {}) as never,
  } as unknown as GraphPortDefinition;
}

/** Normalizes any accepted snapshot/document form to a canonical wrapper. */
export function graphWorkflowSnapshotLikeToCanonical(
  value: GraphWorkflowSnapshotLike | GraphWorkflowDocument
): GraphWorkflowSnapshot {
  if ("document" in value) {
    return value as GraphWorkflowSnapshot;
  }
  if ("state" in value || "definition" in value) {
    return graphWorkflowSnapshotFromLegacy(value as LegacyGraphWorkflowSnapshot);
  }
  return { document: value as GraphWorkflowDocument };
}
