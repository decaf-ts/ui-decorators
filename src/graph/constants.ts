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
  /**
   * Node I/O inspection hints (DECAF-48 §4.6) — viewer mode and which ports
   * map to the inputs/outputs panes. Frontend-safe metadata only.
   */
  inspection?: GraphNodeIoMetadata;
};

export type GraphWorkflowNodeMetadata = {
  id: string;
  kind?: GraphNodeKind;
  label?: string;
  description?: string;
  node?: unknown;
  metadata?: Record<string, unknown>;
  /**
   * Node I/O inspection hints for this workflow instance (DECAF-48 §4.6).
   * Frontend-safe metadata only.
   */
  inspection?: GraphNodeIoMetadata;
};

/**
 * A view-mode choice for the reusable I/O viewer (DECAF-48 §4.6 / Req-9).
 * One shared component renders both the inputs and outputs panes.
 */
export type GraphNodeIoViewMode = "json" | "table" | "raw";

/**
 * Node I/O inspection metadata (DECAF-48 §4.6) — hints the workflow canvas
 * uses to open the inline split view for an already-ran node. Framework
 * neutral, frontend-safe, no engine/runtime dependency (DECAF-24 §4).
 */
export type GraphNodeIoMetadata = {
  /** Default view mode for the reusable viewer. Defaults to "json". */
  view?: GraphNodeIoViewMode;
  /** Port property names shown in the right-side inputs pane. */
  inputPorts?: string[];
  /** Port property names shown in the left-side outputs pane. */
  outputPorts?: string[];
  /** Whether the node exposes editable config (opens the edit modal instead). */
  editable?: boolean;
  /** Free-form extension points. */
  metadata?: Record<string, unknown>;
};

/**
 * Visual treatment for a node/edge execution state (DECAF-48 §4.4). Maps a
 * {@link GraphVisualState} value to the faded glow / fade-after-fail overlay
 * colours used by the canvas renderer.
 */
export type GraphVisualStyle = {
  /** Visual state string as defined by the shared `GraphVisualState` values (e.g. `"running"`, `"blocked"`). */
  state: string;
  /** Glow/border colour for the live run-feedback overlay. */
  glow?: string;
  /** Level of fade for unexecuted/disabled rendering (0..1). */
  opacity?: number;
  /** Optional fill colour when the node is in this state. */
  color?: string;
};

/**
 * The default visual-state → overlay mapping contract (DECAF-48 §4.4):
 * running=faded green, blocked=yellow, errored=red; succeeded keeps the
 * node's own accent; unexecuted-after-failure fades/disabled. This is the
 * shared, framework-neutral source of truth that supersedes the DECAF-32
 * §21.9 running colour for the live run-feedback overlay (§4.5).
 */
export const GRAPH_VISUAL_STATE_STYLES: {
  [state: string]: Omit<GraphVisualStyle, "state">;
} = {
  idle: { opacity: 1 },
  running: { glow: "#22c55e", opacity: 0.85 },
  blocked: { glow: "#eab308", opacity: 0.85 },
  succeeded: { opacity: 1 },
  failed: { glow: "#ef4444", opacity: 1 },
  skipped: { opacity: 0.35 },
};

/**
 * Resolves the visual style overlay for a node/edge execution state, falling
 * back to a neutral default when the state is unknown or unregistered.
 *
 * @param state - The visual state string (as defined by the shared
 * `GraphVisualState` values, e.g. `"running"`, `"blocked"`).
 * @returns The style overlay for the given state.
 */
export function graphVisualStyleOf(
  state: string
): Omit<GraphVisualStyle, "state"> {
  return GRAPH_VISUAL_STATE_STYLES[state] ?? GRAPH_VISUAL_STATE_STYLES.idle;
}

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
  /**
   * Explicit reference to the nested `Model` constructor for Schema port
   * groups. When provided, the reader uses this directly instead of relying
   * on TypeScript's `design:type` metadata (which bundlers like esbuild may
   * tree-shake, replacing the class reference with `Object`).
   *
   * Set via `@input({ model: SomeSchema })` / `@output({ model: SomeSchema })`.
   */
  model?: unknown;
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
