import {
  apply,
  Decoration,
  Metadata,
  metadata,
  propMetadata,
} from "@decaf-ts/decoration";
import { uimodel } from "../model/decorators";
import { GraphKeys, PortDirection } from "./constants";
import type { GraphNodeMetadata, GraphPortMetadata, GraphWorkflowMetadata } from "./constants";
import { graphPortsOf } from "./reader";

export function node(
  tag?: string,
  graph?: GraphNodeMetadata,
  props?: Record<string, any>
) {
  function node(
    tag?: string,
    graph?: GraphNodeMetadata,
    props?: Record<string, any>
  ) {
    const meta: GraphNodeMetadata = {
      kind: graph?.kind || tag,
      ...graph,
    };
    return function innerNode(target: object) {
      return apply(uimodel(tag, props), metadata(GraphKeys.NODE, meta))(target);
    };
  }

  return Decoration.for(GraphKeys.NODE)
    .define({
      decorator: node,
      args: [tag, graph, props],
    })
    .apply();
}

export function graph(
  tag?: string,
  graph?: GraphWorkflowMetadata,
  props?: Record<string, any>
) {
  function graphDecorator(
    tag?: string,
    graph?: GraphWorkflowMetadata,
    props?: Record<string, any>
  ) {
    return function innerGraph(target: object) {
      const ports = graphPortsOf(target as any);
      const meta: GraphWorkflowMetadata = {
        ...(graph || {}),
        kind: graph?.kind || tag,
        inputs:
          graph?.inputs ||
          ports.filter((port) => port.direction === PortDirection.INPUT),
        outputs:
          graph?.outputs ||
          ports.filter((port) => port.direction === PortDirection.OUTPUT),
        connections:
          graph?.connections ||
          ports.filter((port) => port.direction === PortDirection.CONNECTION),
      };
      return apply(uimodel(tag, props), metadata(GraphKeys.GRAPH, meta))(target);
    };
  }

  return Decoration.for(GraphKeys.GRAPH)
    .define({
      decorator: graphDecorator,
      args: [tag, graph, props],
    })
    .apply();
}

export function port(
  direction: PortDirection,
  graph?: Partial<Omit<GraphPortMetadata, "direction">>
) {
  function port(
    direction: PortDirection,
    graph?: Partial<Omit<GraphPortMetadata, "direction">>
  ) {
    return function innerPort(target: object, propertyKey?: any) {
      const meta: GraphPortMetadata = {
        direction,
        ...graph,
      };
      return apply(
        propMetadata(Metadata.key(GraphKeys.PORT, propertyKey), meta)
      )(target, propertyKey);
    };
  }

  return Decoration.for(GraphKeys.PORT)
    .define({
      decorator: port,
      args: [direction, graph],
    })
    .apply();
}

export function input(graph?: Partial<Omit<GraphPortMetadata, "direction">>) {
  return port(PortDirection.INPUT, { ...graph, schema: true });
}

export function output(graph?: Partial<Omit<GraphPortMetadata, "direction">>) {
  return port(PortDirection.OUTPUT, { ...graph, schema: true });
}

/**
 * Declares a "connection" port on a node — a third port kind alongside
 * `@input()` and `@output()`. Connection ports are rendered on the **bottom**
 * side of the node (inputs are on the left, outputs on the right).
 *
 * Connections are typed by `category` (e.g. `"model"`, `"memory"`,
 * `"workspace"`). The category determines the port's color via the
 * {@link registerGraphCategoryStyle} registry.
 *
 * Unlike `@input` / `@output`, connection ports do NOT carry workflow data
 * values — they represent structural dependencies (e.g. an Agent node
 * connecting to a Model resource, a Memory store, or a Workspace). Nodes may
 * have zero or more `@connection()` ports.
 *
 * Usage:
 * ```ts
 * @node("ai.agent", { kind: "ai.agent", category: "Agent" })
 * @model()
 * export class AgentNode extends Model {
 *   @connection({ category: "model", handle: "model" })
 *   model!: unknown;
 *
 *   @connection({ category: "memory", handle: "memory" })
 *   memory!: unknown;
 * }
 * ```
 */
export function connection(graph?: Partial<Omit<GraphPortMetadata, "direction">>) {
  return port(PortDirection.CONNECTION, graph);
}

/**
 * Options for the `@pinnable()` decorator.
 */
export interface GraphPinnableOptions {
  enabled?: boolean;
  ttlMs?: number;
  strategy?: "manual" | "automatic" | "disabled";
  includeDependencies?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Pinning metadata stored on a node via `@pinnable()`.
 */
export interface GraphPinningMetadata {
  enabled: boolean;
  ttlMs?: number;
  strategy: "manual" | "automatic" | "disabled";
  includeDependencies: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Class decorator that marks a graph node as pinnable.
 *
 * The metadata is stored in the node's `graph.metadata.pinnable` field so the
 * Angular renderer and the core pinning policy can read it.
 *
 * Usage:
 * ```ts
 * @node("ai.expensiveCompletion", { kind: "ai.expensiveCompletion" })
 * @pinnable({ strategy: "manual", includeDependencies: true })
 * export class ExpensiveCompletionNode extends Model { ... }
 * ```
 */
export function pinnable(options: GraphPinnableOptions = {}) {
  function pinnable(target: object) {
    const existingMeta = Metadata.get(
      target as any,
      GraphKeys.NODE
    ) as GraphNodeMetadata | undefined;
    const meta: GraphNodeMetadata = existingMeta ?? {};
    meta.metadata = {
      ...(meta.metadata ?? {}),
      pinnable: {
        enabled: options.enabled ?? true,
        ttlMs: options.ttlMs,
        strategy: options.strategy ?? "manual",
        includeDependencies: options.includeDependencies ?? true,
        metadata: options.metadata,
      } as GraphPinningMetadata,
    };
    Metadata.set(target as any, GraphKeys.NODE, meta);
    return target;
  }

  return Decoration.for("graph.pinnable")
    .define({
      decorator: pinnable as any,
      args: [options],
    })
    .apply();
}
