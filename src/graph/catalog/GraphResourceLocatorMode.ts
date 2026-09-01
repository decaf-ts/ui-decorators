import type { GraphJsonValue } from "../document/GraphJsonValue";

export const GRAPH_RESOURCE_LOCATOR_MODES = ["list", "dynamic"] as const;

export type GraphResourceLocatorMode = (typeof GRAPH_RESOURCE_LOCATOR_MODES)[number];

export type GraphResourceLocatorValue = {
  mode: GraphResourceLocatorMode;
  value?: GraphJsonValue;
  placeholder?: string;
};

export function isGraphResourceLocatorMode(value: unknown): value is GraphResourceLocatorMode {
  return (GRAPH_RESOURCE_LOCATOR_MODES as readonly string[]).includes(value as string);
}

export function isGraphResourceLocatorValue(
  value: unknown
): value is GraphResourceLocatorValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    isGraphResourceLocatorMode(record["mode"]) &&
    (record["value"] === undefined || typeof record["value"] !== "function") &&
    (record["placeholder"] === undefined || typeof record["placeholder"] === "string")
  );
}
