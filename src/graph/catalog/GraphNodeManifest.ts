import type { GraphJsonValue } from "../document/GraphJsonValue";
import type { GraphNodeDisplayManifest } from "./GraphNodeDisplayManifest";
import type { GraphPortManifest } from "./GraphPortManifest";
import type { GraphParameterDefinition } from "./GraphParameterDefinition";
import type { GraphNodeMethodManifest } from "./GraphNodeMethodManifest";
import type { GraphNodeCapability } from "./GraphNodeCapability";
import type { GraphNodePolicyManifest } from "./GraphNodePolicyManifest";
import type { GraphCredentialRequirement } from "./GraphCredentialRequirement";
import type { GraphDynamicPortRule } from "./GraphDynamicPortRule";

export interface GraphNodeManifest {
  kind: string;
  display: GraphNodeDisplayManifest;
  inputs: GraphPortManifest[];
  outputs: GraphPortManifest[];
  connections?: GraphPortManifest[];
  parameters: GraphParameterDefinition[];
  dynamicPorts?: GraphDynamicPortRule[];
  credentials?: GraphCredentialRequirement[];
  capabilities?: GraphNodeCapability[];
  methods?: GraphNodeMethodManifest[];
  policies?: GraphNodePolicyManifest;
  metadata?: Record<string, GraphJsonValue>;
}

export function isGraphNodeManifest(value: unknown): value is GraphNodeManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["kind"] === "string" &&
    typeof record["display"] === "object" &&
    Array.isArray(record["inputs"]) &&
    Array.isArray(record["outputs"]) &&
    Array.isArray(record["parameters"])
  );
}

export function graphDataPortManifestsOf(
  manifest: GraphNodeManifest,
  direction: "input" | "output"
): GraphPortManifest[] {
  return (direction === "input" ? manifest.inputs : manifest.outputs).filter(
    (port) => port.direction === direction
  );
}

export function graphConnectionPortManifests(
  manifest: GraphNodeManifest
): GraphPortManifest[] {
  return manifest.connections ?? [];
}
