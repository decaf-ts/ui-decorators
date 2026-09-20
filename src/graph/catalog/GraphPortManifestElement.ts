import type { GraphJsonValue } from "../document/GraphJsonValue";

export interface GraphPortManifestElement {
  tag: string;
  serialize: boolean;
  props: Record<string, GraphJsonValue>;
}

export function isGraphPortManifestElement(
  value: unknown
): value is GraphPortManifestElement {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["tag"] === "string" &&
    typeof record["serialize"] === "boolean" &&
    typeof record["props"] === "object" &&
    record["props"] !== null &&
    !Array.isArray(record["props"])
  );
}
