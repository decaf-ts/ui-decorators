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

// ---------------------------------------------------------------------------
// Shared graph execution contract (DECAF-50 Phase A, moved from
// integrations/graph/shared): frontend-safe constants and enums consumed by
// both the backend engine and frontend bundles over SSE.
// ---------------------------------------------------------------------------

import type { GraphRunStatus } from "./types";

/**
 * Disabled-node execution semantics (DECAF-50 §4.9).
 *
 * - `skip` — the node does not execute and produces no outputs.
 * - `passThroughFirstInput` — the first incoming edge value is forwarded on
 *   the node's first declared output port.
 * - `emitDefaults` — every declared output port is emitted with its default
 *   (absent a declared default, `undefined`).
 */
export const GRAPH_DISABLED_NODE_BEHAVIORS = [
  "skip",
  "passThroughFirstInput",
  "emitDefaults",
] as const;

/** How a disabled node behaves during execution (DECAF-50 §4.8): skip it, pass through its first input, or emit default outputs. */
export type GraphDisabledNodeBehavior = (typeof GRAPH_DISABLED_NODE_BEHAVIORS)[number];

/** The disabled-node behavior applied when a node declares none. */
export const GRAPH_DEFAULT_DISABLED_NODE_BEHAVIOR: GraphDisabledNodeBehavior = "skip";

/** Type guard for {@link GraphDisabledNodeBehavior}. */
export function isGraphDisabledNodeBehavior(
  value: unknown
): value is GraphDisabledNodeBehavior {
  return (GRAPH_DISABLED_NODE_BEHAVIORS as readonly string[]).includes(
    value as string
  );
}

/**
 * Execution status for a workflow or individual node.
 */
export enum GraphExecutionStatus {
  PENDING = "pending",
  PLANNING = "planning",
  RUNNING = "running",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  SKIPPED = "skipped",
  CANCELLED = "cancelled",
  CACHED = "cached",
}

/**
 * Visual execution state for a node or edge on the workflow canvas.
 *
 * Frontend-safe (DECAF-48 §4.4): a superset of {@link GraphExecutionStatus}
 * normalised for rendering. `BLOCKED` is derived from the plan and execution
 * events (waiting on upstream dependencies), not emitted as an engine status.
 * `SKIPPED` is the post-failure "unexecuted/disabled" visual state.
 */
export enum GraphVisualState {
  IDLE = "idle",
  RUNNING = "running",
  BLOCKED = "blocked",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  SKIPPED = "skipped",
}


/**
 * Namespace root for graph run SSE topics (DECAF-48 §4.2). A subscription
 * filters on these granular topics before `observer.next(...)`.
 */
export const GRAPH_RUN_TOPIC = "graph.run";

/**
 * SSE sub-topic streaming per-node log lines during a run.
 */
export const GRAPH_RUN_LOG_TOPIC = `${GRAPH_RUN_TOPIC}.log`;

/**
 * SSE sub-topic streaming node/edge execution-state updates during a run.
 */
export const GRAPH_RUN_STATE_TOPIC = `${GRAPH_RUN_TOPIC}.state`;

/**
 * Logger custom-attribute keys attached to every run log line via
 * DECAF-9 `logger.for({...})` (DECAF-48 §4.3). Rendered as discrete columns
 * (not buried in the message string).
 */
export enum GraphLogAttribute {
  NODE_ID = "nodeId",
  WORKFLOW_ID = "workflowId",
  RUN_ID = "runId",
  USER = "user",
}

/**
 * Namespace topic helper for a graph execution event.
 *
 * Log-carrier events resolve to `graph.run.log`; node/edge execution-state
 * events resolve to `graph.run.state`; everything else stays under the shared
 * `graph.run` topic and is only delivered to subscribers that match it.
 *
 * @param eventType - The graph execution event type to scope to a topic.
 * @returns The SSE topic constant for the given event type.
 */
export function graphRunTopicOf(eventType: GraphExecutionEventType): string {
  switch (eventType) {
    case GraphExecutionEventType.GRAPH_RUN_LOG:
      return GRAPH_RUN_LOG_TOPIC;
    case GraphExecutionEventType.NODE_STATE_CHANGED:
    case GraphExecutionEventType.EDGE_STATE_CHANGED:
      return GRAPH_RUN_STATE_TOPIC;
    default:
      return GRAPH_RUN_TOPIC;
  }
}

/**
 * Event types emitted through the graph execution observer pipeline.
 *
 * DECAF-48 extends this set with the visual-state and run-log event types the
 * engine emits on the existing Observable: {@link GraphExecutionEventType.NODE_STATE_CHANGED},
 * {@link GraphExecutionEventType.EDGE_STATE_CHANGED} and
 * {@link GraphExecutionEventType.GRAPH_RUN_LOG}.
 */
export enum GraphExecutionEventType {
  WORKFLOW_STARTED = "workflow.started",
  WORKFLOW_PLANNED = "workflow.planned",
  WORKFLOW_COMPLETED = "workflow.completed",
  WORKFLOW_FAILED = "workflow.failed",
  WORKFLOW_CANCELLED = "workflow.cancelled",

  NODE_QUEUED = "node.queued",
  NODE_STARTED = "node.started",
  NODE_OUTPUT = "node.output",
  NODE_COMPLETED = "node.completed",
  NODE_FAILED = "node.failed",
  NODE_SKIPPED = "node.skipped",
  NODE_CACHE_HIT = "node.cacheHit",
  NODE_PINNED = "node.pinned",
  NODE_UNPINNED = "node.unpinned",
  /** Node execution-state transition carrying a `GraphNodeStateChangedPayload` (DECAF-48 §4.4). */
  NODE_STATE_CHANGED = "node.stateChanged",

  EDGE_VALUE_ROUTED = "edge.valueRouted",
  /** Edge execution-state transition carrying a `GraphEdgeStateChangedPayload` (DECAF-48 §4.4). */
  EDGE_STATE_CHANGED = "edge.stateChanged",

  /** Structured run log line carrying a `GraphRunLogEntry` (DECAF-48 §4.3). */
  GRAPH_RUN_LOG = "graph.run.log",

  LOOP_STARTED = "loop.started",
  LOOP_ITERATION_STARTED = "loop.iteration.started",
  LOOP_ITERATION_COMPLETED = "loop.iteration.completed",
  LOOP_CONDITION_EVALUATED = "loop.condition.evaluated",
  LOOP_COMPLETED = "loop.completed",
  LOOP_LIMIT_REACHED = "loop.limitReached",

  VALIDATION_STARTED = "validation.started",
  VALIDATION_FAILED = "validation.failed",
  VALIDATION_COMPLETED = "validation.completed",

  STORE_READ = "store.read",
  STORE_WRITE = "store.write",
  STORE_DELETE = "store.delete",
}

/**
 * Hard limits for the graph run subsystem (DECAF-50 §4.14/§4.16).
 *
 * Enforced by the run executor and the HTTP run controller; every omitted
 * field falls back to {@link DEFAULT_GRAPH_RUN_LIMITS}.
 */
export interface GraphRunLimits {
  /** Maximum serialised JSON size accepted for a run create request. */
  maxRequestBytes?: number;
  /**
   * Maximum number of runs in flight per caller: the run's owner user, or
   * the caller-key bucket supplied by the HTTP layer for anonymous callers
   * (per-IP where the host exposes it, a shared `"anonymous"` bucket
   * otherwise).
   */
  maxConcurrentRuns?: number;
  /** Maximum events retained per run by the in-memory event store. */
  maxEventsPerRun?: number;
  /** Maximum serialised size of a single event envelope `payload`. */
  maxEventPayloadBytes?: number;
  /** Hard wall-clock budget for a run's engine execution. */
  executionTimeoutMs?: number;
  /**
   * How long a terminal run's replayable event state is kept after the run
   * finishes before being released (SAA-595 resource governance).
   */
  eventReplayWindowMs?: number;
}

/** Default run limits: request size, per-caller concurrency, event retention/payload size, execution timeout, and post-terminal event replay window. */
export const DEFAULT_GRAPH_RUN_LIMITS: Required<GraphRunLimits> = {
  maxRequestBytes: 4_000_000,
  maxConcurrentRuns: 32,
  maxEventsPerRun: 10_000,
  maxEventPayloadBytes: 256_000,
  executionTimeoutMs: 600_000,
  eventReplayWindowMs: 300_000,
};

/**
 * Terminal graph event types closing a run's SSE stream
 * (DECAF-50 §4.15). The run SSE endpoint never emits anything after these.
 */
export const GRAPH_RUN_TERMINAL_EVENT_TYPES: readonly GraphExecutionEventType[] =
  [
    GraphExecutionEventType.WORKFLOW_COMPLETED,
    GraphExecutionEventType.WORKFLOW_FAILED,
    GraphExecutionEventType.WORKFLOW_CANCELLED,
  ];

/** Whether the event type is a run-stream terminal type (see {@link GRAPH_RUN_TERMINAL_EVENT_TYPES}). */
export function isGraphRunTerminalEventType(
  type: GraphExecutionEventType
): boolean {
  return GRAPH_RUN_TERMINAL_EVENT_TYPES.includes(type);
}

/** Whether the run status is terminal (`succeeded`, `failed`, or `cancelled`). */
export function isGraphRunTerminalStatus(status: GraphRunStatus): boolean {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}

/** Type guard for {@link GraphRunStatus}. */
export function isGraphRunStatus(value: unknown): value is GraphRunStatus {
  return (
    typeof value === "string" &&
    [
      "queued",
      "validating",
      "running",
      "succeeded",
      "failed",
      "cancelled",
    ].includes(value)
  );
}
