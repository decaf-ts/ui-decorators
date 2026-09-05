/**
 * @module ui-decorators/graph/nodes
 * @summary Shared node kind declarations (DECAF-32 §22.2, DECAF-50 Phase A).
 * @description Canonical `@node`-decorated classes for the ALFRED-5 node kind
 * taxonomy, laid out one node per file under `nodes/<category>/<node>.ts`:
 * triggers (§22.2.1), flow-control and utility nodes (§22.2.2–22.2.3), the
 * Agent node (§21.3), the three loop kinds (`core.loop.foreach/while/until`,
 * §5.9), and the workflow input-value boundary node. Shared non-node support
 * (base class, category styles, manifests) lives in sibling files under the
 * same tree. Consumers (for-angular, ALFRED, etc.) import these declarations
 * to populate node palettes, registries, and reference snapshots.
 */
export * from "./base";
export * from "./category-styles";
export * from "./flow-control/break";
export * from "./flow-control/error-boundary";
export * from "./flow-control/human-approval";
export * from "./flow-control/if";
export * from "./flow-control/parallel";
export * from "./flow-control/switch";
export * from "./utility/code";
export * from "./utility/delay";
export * from "./utility/log";
export * from "./utility/map";
export * from "./utility/merge";
export * from "./utility/return";
export * from "./utility/utility-log";
export * from "./triggers/chat";
export * from "./triggers/event";
export * from "./triggers/form";
export * from "./triggers/manual";
export * from "./triggers/schedule";
export * from "./triggers/webhook";
export * from "./agents/agent";
export * from "./loops/foreach";
export * from "./loops/until";
export * from "./loops/while";
export * from "./boundary/input-value";
export * from "./manifests";

import { BreakFlowNode } from "./flow-control/break";
import { ErrorBoundaryFlowNode } from "./flow-control/error-boundary";
import { HumanApprovalFlowNode } from "./flow-control/human-approval";
import { IfFlowNode } from "./flow-control/if";
import { ParallelFlowNode } from "./flow-control/parallel";
import { SwitchFlowNode } from "./flow-control/switch";
import { CodeFlowNode } from "./utility/code";
import { DelayFlowNode } from "./utility/delay";
import { LogFlowNode } from "./utility/log";
import { MapFlowNode } from "./utility/map";
import { MergeFlowNode } from "./utility/merge";
import { ReturnFlowNode } from "./utility/return";
import { UtilityLogNode } from "./utility/utility-log";
import { ChatTriggerNode } from "./triggers/chat";
import { EventTriggerNode } from "./triggers/event";
import { FormTriggerNode } from "./triggers/form";
import { ManualTriggerNode } from "./triggers/manual";
import { ScheduleTriggerNode } from "./triggers/schedule";
import { WebhookTriggerNode } from "./triggers/webhook";
import { GraphForeachLoopNode } from "./loops/foreach";
import { GraphUntilLoopNode } from "./loops/until";
import { GraphWhileLoopNode } from "./loops/while";
import { GraphInputValueNode } from "./boundary/input-value";

/**
 * All built-in trigger node constructors.
 */
export const GRAPH_TRIGGER_NODES = [
  ManualTriggerNode,
  WebhookTriggerNode,
  ScheduleTriggerNode,
  EventTriggerNode,
  FormTriggerNode,
  ChatTriggerNode,
] as const;

/**
 * All built-in flow-control node constructors.
 */
export const GRAPH_FLOW_CONTROL_NODES = [
  IfFlowNode,
  SwitchFlowNode,
  ParallelFlowNode,
  MergeFlowNode,
  MapFlowNode,
  DelayFlowNode,
  ErrorBoundaryFlowNode,
  HumanApprovalFlowNode,
  ReturnFlowNode,
  CodeFlowNode,
  LogFlowNode,
  UtilityLogNode,
  BreakFlowNode,
] as const;

/**
 * All built-in loop node constructors (shared declarations of the
 * `core.loop.*` system kinds).
 */
export const GRAPH_LOOP_NODES = [
  GraphForeachLoopNode,
  GraphWhileLoopNode,
  GraphUntilLoopNode,
] as const;

/**
 * All built-in boundary node constructors.
 */
export const GRAPH_BOUNDARY_NODES = [GraphInputValueNode] as const;
