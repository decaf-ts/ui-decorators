import type { GraphJsonPrimitive } from "../document/GraphJsonValue";
import { isGraphJsonPrimitive } from "../document/GraphJsonValue";
import type { GraphPortManifest } from "./GraphPortManifest";
import { isGraphPortManifest } from "./GraphPortManifest";

export type GraphRepeatFromParameterRule = {
  type: "repeatFromParameter";
  parameter: string;
  itemIdPath: string;
  itemLabelPath?: string;
  direction: "input" | "output" | "connection";
  portIdTemplate: string;
  defaultPort?: GraphPortManifest;
};

export type GraphTogglePortRule = {
  type: "togglePort";
  parameter: string;
  equals: GraphJsonPrimitive;
  port: GraphPortManifest;
};

export type GraphDynamicPortRule = GraphRepeatFromParameterRule | GraphTogglePortRule;

export const GRAPH_DYNAMIC_PORT_RULE_TYPES = ["repeatFromParameter", "togglePort"] as const;

export type GraphDynamicPortRuleType = (typeof GRAPH_DYNAMIC_PORT_RULE_TYPES)[number];

export function isGraphDynamicPortRuleType(value: unknown): value is GraphDynamicPortRuleType {
  return (GRAPH_DYNAMIC_PORT_RULE_TYPES as readonly string[]).includes(value as string);
}

const GRAPH_PORT_RULE_DIRECTIONS = ["input", "output", "connection"] as const;

export function isGraphDynamicPortRule(value: unknown): value is GraphDynamicPortRule {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (record["type"] === "repeatFromParameter") {
    return (
      typeof record["parameter"] === "string" &&
      typeof record["itemIdPath"] === "string" &&
      (GRAPH_PORT_RULE_DIRECTIONS as readonly string[]).includes(
        record["direction"] as string
      ) &&
      typeof record["portIdTemplate"] === "string"
    );
  }
  if (record["type"] === "togglePort") {
    return (
      typeof record["parameter"] === "string" &&
      isGraphJsonPrimitive(record["equals"]) &&
      Boolean(isGraphPortManifest(record["port"]))
    );
  }
  return false;
}
