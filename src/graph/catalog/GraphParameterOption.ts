import type { GraphJsonPrimitive } from "../document/GraphJsonValue";
import { isGraphJsonPrimitive } from "../document/GraphJsonValue";

export interface GraphParameterOption {
  label: string;
  value: GraphJsonPrimitive;
  description?: string;
}

export function isGraphParameterOption(value: unknown): value is GraphParameterOption {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["label"] === "string" &&
    isGraphJsonPrimitive(record["value"]) &&
    (record["description"] === undefined || typeof record["description"] === "string")
  );
}

export function isGraphParameterOptionArray(value: unknown): value is GraphParameterOption[] {
  return Array.isArray(value) && value.every(isGraphParameterOption);
}
