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
  return port(PortDirection.INPUT, graph);
}

export function output(graph?: Partial<Omit<GraphPortMetadata, "direction">>) {
  return port(PortDirection.OUTPUT, graph);
}
