import type { GraphJsonValue } from "./GraphJsonValue";
import type { GraphWorkflowDocument } from "./GraphWorkflowDocument";

export type GraphValueReference =
  | { source: "workflow"; port: string }
  | { source: "node"; nodeId: string; port: string }
  | { source: "literal"; value: GraphJsonValue }
  | { source: "expression"; expression: string };

export interface GraphLoopConfiguration {
  body: GraphWorkflowDocument;
  maxIterations?: number;
  timeoutMs?: number;
  concurrency?: number;
  inputMappings?: Record<string, GraphValueReference>;
  outputMappings?: Record<string, GraphValueReference>;
}
