import type { GraphJsonValue } from "../document/GraphJsonValue";
import type { GraphIconReference } from "./GraphIconReference";

export interface GraphNodeDisplayManifest {
  name: string;
  description?: string;
  category?: string;
  group?: string;
  labels?: string[];
  icon?: GraphIconReference;
  color?: string;
  width?: number;
  minWidth?: number;
  height?: number;
  metadata?: Record<string, GraphJsonValue>;
}

export function isGraphNodeDisplayManifest(
  value: unknown
): value is GraphNodeDisplayManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record["name"] === "string";
}
