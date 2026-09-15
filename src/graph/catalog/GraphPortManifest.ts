import type { GraphJsonValue } from "../document/GraphJsonValue";
import type { GraphConnectionPolicy } from "./GraphConnectionPolicy";
import type { GraphValueSchema } from "./GraphValueSchema";

export interface GraphPortManifest {
  id: string;
  label: string;
  direction: "input" | "output" | "connection";
  schema?: GraphValueSchema;
  required?: boolean;
  hidden?: boolean;
  category?: string;
  handle?: string;
  connectionPolicy?: GraphConnectionPolicy;
  configurable?: boolean;
  defaultMode?: "edge" | "literal" | "expression";
  metadata?: Record<string, GraphJsonValue>;
}

export const GRAPH_PORT_MANIFEST_DIRECTIONS = ["input", "output", "connection"] as const;

export type GraphPortManifestDirection = (typeof GRAPH_PORT_MANIFEST_DIRECTIONS)[number];

export function isGraphPortManifestDirection(value: unknown): value is GraphPortManifestDirection {
  return (GRAPH_PORT_MANIFEST_DIRECTIONS as readonly string[]).includes(value as string);
}

export function isGraphPortManifest(value: unknown): value is GraphPortManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["id"] === "string" &&
    typeof record["label"] === "string" &&
    isGraphPortManifestDirection(record["direction"])
  );
}
