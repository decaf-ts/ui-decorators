import type { GraphJsonPrimitive } from "../document/GraphJsonValue";

export type { GraphJsonValue, GraphJsonPrimitive } from "../document/GraphJsonValue";

export type GraphAnyValueSchema = { type: "any" };

export type GraphStringValueSchema = {
  type: "string";
  format?: string;
};

export type GraphNumberValueSchema = {
  type: "number";
  integer?: boolean;
  min?: number;
  max?: number;
};

export type GraphBooleanValueSchema = { type: "boolean" };

export type GraphArrayValueSchema = {
  type: "array";
  items: GraphValueSchema;
  minItems?: number;
  maxItems?: number;
};

export type GraphObjectValueSchema = {
  type: "object";
  properties: Record<string, GraphValueSchema>;
  required?: string[];
  additionalProperties?: boolean;
};

export type GraphEnumValueSchema = {
  type: "enum";
  values: GraphJsonPrimitive[];
};

export type GraphModelValueSchema = {
  type: "model";
  name: string;
  properties?: Record<string, GraphValueSchema>;
};

export type GraphValueSchema =
  | GraphAnyValueSchema
  | GraphStringValueSchema
  | GraphNumberValueSchema
  | GraphBooleanValueSchema
  | GraphArrayValueSchema
  | GraphObjectValueSchema
  | GraphEnumValueSchema
  | GraphModelValueSchema;

export const GRAPH_VALUE_SCHEMA_TYPES = [
  "any",
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "enum",
  "model",
] as const;

export type GraphValueSchemaType = (typeof GRAPH_VALUE_SCHEMA_TYPES)[number];

export function isGraphValueSchemaType(value: unknown): value is GraphValueSchemaType {
  return (GRAPH_VALUE_SCHEMA_TYPES as readonly string[]).includes(value as string);
}

export function isGraphValueSchema(value: unknown): value is GraphValueSchema {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return isGraphValueSchemaType((value as Record<string, unknown>)["type"]);
}
