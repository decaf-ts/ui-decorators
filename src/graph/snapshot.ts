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

export type GraphWorkflowSnapshot = {
  version: typeof GRAPH_WORKFLOW_SNAPSHOT_VERSION;
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
): GraphWorkflowSnapshot {
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
  snapshot: GraphWorkflowSnapshot | GraphWorkflowSnapshotInput,
  model?: GraphModelLike<M> | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition
): GraphWorkflowSnapshot {
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

  const fullSnapshot = snapshot as GraphWorkflowSnapshot;
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
  snapshot: GraphWorkflowSnapshot,
  space?: number
): string {
  return JSON.stringify(snapshot, undefined, space);
}

export function graphWorkflowSnapshotFromJSON(
  input: string | GraphWorkflowSnapshot,
  model?: GraphModelLike | GraphWorkflowDefinition | GraphWorkflowSnapshotDefinition
): GraphWorkflowSnapshot {
  const snapshot =
    typeof input === "string" ? (JSON.parse(input) as GraphWorkflowSnapshot) : input;
  return graphWorkflowSnapshotRestore(snapshot, model);
}

export function graphWorkflowSnapshotInputValuesOf(
  snapshot: GraphWorkflowSnapshot
): Record<string, unknown> {
  return Object.fromEntries(
    snapshot.state.inputs.map((entry) => [entry.path, cloneValue(entry.value)])
  );
}

export function graphWorkflowSnapshotOutputValuesOf(
  snapshot: GraphWorkflowSnapshot
): Record<string, unknown> {
  return Object.fromEntries(
    snapshot.state.outputs.map((entry) => [entry.path, cloneValue(entry.value)])
  );
}
