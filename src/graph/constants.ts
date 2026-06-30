export enum GraphKeys {
  GRAPH = "graph",
  NODE = `${GraphKeys.GRAPH}.node`,
  EDGE = `${GraphKeys.GRAPH}.edge`,
  PORT = `${GraphKeys.GRAPH}.port`,
}

export enum PortDirection {
  INPUT = "input",
  OUTPUT = "output",
}

export type GraphNodeKind = string;

export type GraphConnectionRule = {
  allowSelf?: boolean;
  allowMultiple?: boolean;
  allowedKinds?: GraphNodeKind[];
  blockedKinds?: GraphNodeKind[];
  group?: string;
  maxConnections?: number;
  metadata?: Record<string, unknown>;
};

export type GraphNodeMetadata = {
  kind?: GraphNodeKind;
  category?: string;
  color?: string;
  group?: string;
  height?: number;
  icon?: string;
  labels?: string[];
  maxChildren?: number;
  minWidth?: number;
  width?: number;
  connectionRules?: GraphConnectionRule;
  metadata?: Record<string, unknown>;
  /**
   * Per-group rendering choice for Schema-typed `@input` / `@output` properties
   * (the one-vs-all toggle). See {@link GraphPortGroupMetadata}.
   */
  portGroups?: GraphPortGroupMetadata[];
};

export type GraphWorkflowNodeMetadata = {
  id: string;
  kind?: GraphNodeKind;
  label?: string;
  description?: string;
  node?: unknown;
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowRelationMetadata = {
  source: string | unknown;
  sourcePort?: string;
  target: string | unknown;
  targetPort?: string;
  label?: string;
  metadata?: Record<string, unknown>;
};

export type GraphWorkflowMetadata = GraphNodeMetadata & {
  inputs?: GraphPortDefinition[];
  outputs?: GraphPortDefinition[];
  nodes?: GraphWorkflowNodeMetadata[];
  relations?: GraphWorkflowRelationMetadata[];
};

export type GraphPortMetadata = {
  direction: PortDirection;
  connectionRules?: GraphConnectionRule;
  visible?: boolean;
  handle?: string;
  expand?: boolean;
  metadata?: Record<string, unknown>;
  /**
   * Marks this port as a "Schema port" declared via `@input` / `@output`.
   *
   * When `true` AND the property type is a Decaf `Model` (a "Schema"), the
   * reader flattens the Schema's own `@input` / `@output` properties into the
   * parent node's port list (unprefixed — no `<schemaProp>.` prefix), instead
   * of producing a composite port with prefixed children. A `@input` Schema
   * contributes only the Schema's `@input` properties; a `@output` Schema
   * contributes only the Schema's `@output` properties. The carrier property
   * itself (e.g. `inputSchema`) is not emitted as a port — it is the group
   * carrier.
   *
   * Set automatically by `@input` / `@output`; NOT set by `@port`, so
   * `@port`-decorated Schema-typed properties keep the legacy composite
   * expansion (prefixed children).
   */
  schema?: boolean;
};

/**
 * Metadata for a Schema port group — the one-vs-all rendering choice for a
 * `@input` / `@output` Schema-typed property.
 *
 * `toggle: "all"` (default) renders each Schema property as its own connectable
 * port on the canvas. `toggle: "single"` renders one grouped port that receives
 * the whole object and maps it to the right place. The per-instance
 * manual-fill (hide a port because its value is supplied via the CRUD field)
 * is NOT carried here — that is the editor's port-toggle state in `node.data`.
 */
export type GraphPortGroupMetadata = {
  /** The Schema-typed `@input` / `@output` property name that owns this group. */
  property: string;
  /** Render choice for this group. Defaults to `"all"`. */
  toggle?: "single" | "all";
  /** Optional label for the grouped port when `toggle === "single"`. */
  label?: string;
};

export type GraphPortDefinition = {
  property: string;
  path?: string;
  direction: PortDirection;
  name: string;
  label: string;
  type?: string;
  required: boolean;
  hidden: boolean;
  designType?: string;
  element?: Record<string, any>;
  prop?: Record<string, any>;
  validation?: Record<string, any>;
  graph?: GraphPortMetadata;
  connectionRules?: GraphConnectionRule;
  composite?: boolean;
  children?: GraphPortDefinition[];
  model?: string;
};

export type GraphNodeDefinition = {
  name: string;
  tag: string;
  kind: GraphNodeKind;
  category?: string;
  color?: string;
  group?: string;
  height?: number;
  icon?: string;
  labels: string[];
  maxChildren?: number;
  minWidth?: number;
  width?: number;
  props?: Record<string, any>;
  ui?: Record<string, any>;
  graph?: GraphNodeMetadata;
  ports: GraphPortDefinition[];
  /**
   * Per-group rendering choice for Schema-typed `@input` / `@output` properties
   * (the one-vs-all toggle). Derived from {@link GraphNodeMetadata.portGroups};
   * every Schema-typed `@input` / `@output` property not listed defaults to
   * `toggle: "all"`.
   */
  portGroups?: GraphPortGroupMetadata[];
};

export type GraphWorkflowDefinition = GraphNodeDefinition & {
  inputs: GraphPortDefinition[];
  outputs: GraphPortDefinition[];
  nodes: GraphWorkflowNodeMetadata[];
  relations: GraphWorkflowRelationMetadata[];
  workflow: GraphWorkflowMetadata;
};
