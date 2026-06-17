import {
  apply,
  Decoration,
  Metadata,
  metadata,
  propMetadata,
} from "@decaf-ts/decoration";
import { GraphKeys, PortDirection } from "./constants";

export type NodeMetadata = {};

export function node() {
  function node() {
    const meta: NodeMetadata = {};
    return function innerNode(target: object) {
      return apply(metadata(GraphKeys.NODE, meta))(target);
    };
  }

  return Decoration.for(GraphKeys.NODE)
    .define({
      decorator: node,
      args: [],
    })
    .apply();
}

export type PortMetadata = {
  direction: PortDirection;
};

export function port(direction: PortDirection) {
  function port() {
    return function innerPort(target: object, propertyKey?: any) {
      const meta: PortMetadata = {
        direction,
      };
      return apply(
        propMetadata(Metadata.key(GraphKeys.PORT, propertyKey), meta)
      )(target, propertyKey);
    };
  }

  return Decoration.for(GraphKeys.PORT)
    .define({
      decorator: port,
      args: [],
    })
    .apply();
}

export function input() {
  return port(PortDirection.INPUT);
}

export function output() {
  return port(PortDirection.OUTPUT);
}
