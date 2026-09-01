import type { GraphParameterBase } from "./GraphParameterBase";
import type { GraphParameterOption } from "./GraphParameterOption";
import type { GraphResourceLocatorMode } from "./GraphResourceLocatorMode";

export interface GraphStringParameter extends GraphParameterBase {
  type: "string";
  multiline?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface GraphNumberParameter extends GraphParameterBase {
  type: "number";
  integer?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface GraphBooleanParameter extends GraphParameterBase {
  type: "boolean";
}

export interface GraphOptionsParameter extends GraphParameterBase {
  type: "options";
  options?: GraphParameterOption[];
  loadOptionsMethod?: string;
  multiple?: boolean;
}

export interface GraphCollectionParameter extends GraphParameterBase {
  type: "collection";
  itemIdPath?: string;
  itemLabelPath?: string;
  itemParameters?: GraphParameterDefinition[];
  maxItems?: number;
}

export interface GraphObjectParameter extends GraphParameterBase {
  type: "object";
  properties?: GraphParameterDefinition[];
}

export interface GraphCodeParameter extends GraphParameterBase {
  type: "code";
  language: "javascript" | "typescript" | "json" | "text";
  validateMethod?: string;
}

export interface GraphExpressionParameter extends GraphParameterBase {
  type: "expression";
}

export interface GraphResourceLocatorParameter extends GraphParameterBase {
  type: "resourceLocator";
  modes: GraphResourceLocatorMode[];
}

export interface GraphCredentialParameter extends GraphParameterBase {
  type: "credential";
  credentialType: string;
}

export interface GraphNoticeParameter extends GraphParameterBase {
  type: "notice";
  noticeVariant: "info" | "warning" | "error" | "success";
  noticeContent: string;
}

export interface GraphHiddenParameter extends GraphParameterBase {
  type: "hidden";
}

export type GraphParameterDefinition =
  | GraphStringParameter
  | GraphNumberParameter
  | GraphBooleanParameter
  | GraphOptionsParameter
  | GraphCollectionParameter
  | GraphObjectParameter
  | GraphCodeParameter
  | GraphExpressionParameter
  | GraphResourceLocatorParameter
  | GraphCredentialParameter
  | GraphNoticeParameter
  | GraphHiddenParameter;

export const GRAPH_PARAMETER_TYPES = [
  "string",
  "number",
  "boolean",
  "options",
  "collection",
  "object",
  "code",
  "expression",
  "resourceLocator",
  "credential",
  "notice",
  "hidden",
] as const;

export type GraphParameterDefinitionType = (typeof GRAPH_PARAMETER_TYPES)[number];

export function isGraphParameterDefinitionType(value: unknown): value is GraphParameterDefinitionType {
  return (GRAPH_PARAMETER_TYPES as readonly string[]).includes(value as string);
}

export function isGraphParameterDefinition(value: unknown): value is GraphParameterDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return isGraphParameterDefinitionType((value as Record<string, unknown>)["type"]);
}
