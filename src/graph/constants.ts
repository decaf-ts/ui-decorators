export enum GraphKeys {
  GRAPH = "graph",
  NODE = `${GraphKeys.GRAPH}.node`,
  EDGE = `${GraphKeys.GRAPH}.edge`,
  PORT = `${GraphKeys.GRAPH}.port`,
}

export enum PortDirection {
  INPUT = "input",
  OUTPUT = "output",
  CONNECTION = "connection",
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
  connections?: GraphPortDefinition[];
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
   * Optional category for `@connection()` ports (e.g. `"model"`, `"memory"`,
   * `"workspace"`). Connections of the same category share a color and icon
   * defined by the {@link GRAPH_CATEGORY_STYLE_REGISTRY}. When omitted, the
   * port inherits the node's color.
   */
  category?: string;
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
   * Effective color resolved from the category registry (or the node's
   * explicit `color` override). Computed by `graphDefinitionOf`.
   */
  effectiveColor?: string;
  /**
   * Effective icon resolved from the category registry (or the node's
   * explicit `icon` override). Computed by `graphDefinitionOf`.
   */
  effectiveIcon?: string;
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
  connections: GraphPortDefinition[];
  nodes: GraphWorkflowNodeMetadata[];
  relations: GraphWorkflowRelationMetadata[];
  workflow: GraphWorkflowMetadata;
};

/**
 * Style (color + icon) assigned to a node or connection category. Nodes and
 * connections without an explicit `color` / `icon` inherit from their
 * category's style.
 */
export interface GraphCategoryStyle {
  color: string;
  icon?: string;
}

/**
 * Registry mapping category names to their default style (color + icon).
 * Consumers register categories via {@link registerGraphCategoryStyle}.
 *
 * The engine and renderer resolve the "effective" color/icon for a node by
 * checking the node's explicit `color` / `icon` first, then falling back to
 * the category's style, then a default.
 */
const GRAPH_CATEGORY_STYLE_REGISTRY: Record<string, GraphCategoryStyle> = {};

/**
 * Default fallback style when no category is registered and no explicit
 * color/icon is set on the node.
 */
export const GRAPH_DEFAULT_CATEGORY_STYLE: GraphCategoryStyle = {
  color: "#64748b",
  icon: "ti-pointer",
};

/**
 * Registers a category style (color + optional icon) in the global registry.
 * Call this at module init time (e.g. in the engine's node declarations) to
 * define the visual style for a category of nodes or connections.
 */
export function registerGraphCategoryStyle(
  category: string,
  style: GraphCategoryStyle
): void {
  GRAPH_CATEGORY_STYLE_REGISTRY[category] = style;
}

/**
 * Returns the style registered for `category`, or the default fallback style.
 */
export function graphCategoryStyleOf(category?: string): GraphCategoryStyle {
  if (category && GRAPH_CATEGORY_STYLE_REGISTRY[category]) {
    return GRAPH_CATEGORY_STYLE_REGISTRY[category];
  }
  return GRAPH_DEFAULT_CATEGORY_STYLE;
}

/**
 * Resolves the effective color for a node: explicit `color` overrides the
 * category color, which overrides the default.
 */
export function resolveEffectiveColor(
  explicitColor?: string,
  category?: string
): string {
  if (explicitColor) return explicitColor;
  return graphCategoryStyleOf(category).color;
}

/**
 * Resolves the effective icon for a node: explicit `icon` overrides the
 * category icon, which overrides the default.
 */
export function resolveEffectiveIcon(
  explicitIcon?: string,
  category?: string
): string {
  if (explicitIcon) return explicitIcon;
  return graphCategoryStyleOf(category).icon ?? GRAPH_DEFAULT_CATEGORY_STYLE.icon!;
}
