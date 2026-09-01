import type { GraphJsonValue } from "./GraphJsonValue";
import { isGraphJsonValue } from "./GraphJsonValue";

export type GraphInputBindingMode = "edge" | "literal" | "expression";

export type GraphEdgeInputBinding = {
  mode: "edge";
};

export type GraphLiteralInputBinding = {
  mode: "literal";
  value: GraphJsonValue;
};

export type GraphExpressionInputBinding = {
  mode: "expression";
  expression: string;
};

export type GraphInputBinding =
  | GraphEdgeInputBinding
  | GraphLiteralInputBinding
  | GraphExpressionInputBinding;

export type GraphOutputBinding = {
  enabled?: boolean;
  alias?: string;
  metadata?: Record<string, GraphJsonValue>;
};

export function isGraphInputBindingMode(value: unknown): value is GraphInputBindingMode {
  return value === "edge" || value === "literal" || value === "expression";
}

export function isGraphInputBinding(value: unknown): value is GraphInputBinding {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const mode = (value as Record<string, unknown>)["mode"];
  if (mode === "edge") return Reflect.ownKeys(value).length === 1;
  if (mode === "literal") {
    const value_ = (value as Record<string, unknown>)["value"];
    return (
      Object.keys(value as Record<string, unknown>).length === 2 &&
      isGraphJsonValue(value_)
    );
  }
  if (mode === "expression") {
    return (
      Object.keys(value as Record<string, unknown>).length === 2 &&
      typeof (value as Record<string, unknown>)["expression"] === "string"
    );
  }
  return false;
}
