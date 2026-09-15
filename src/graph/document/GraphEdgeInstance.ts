import type { GraphEndpoint } from "./GraphEndpoint";
import type { GraphJsonValue } from "./GraphJsonValue";
import type { GraphEdgeUiState } from "./GraphWorkflowUiState";

export interface GraphEdgeInstance {
  id: string;
  type: "data" | "connection";
  source: GraphEndpoint;
  target: GraphEndpoint;
  label?: string;
  metadata?: Record<string, GraphJsonValue>;
  ui?: GraphEdgeUiState;
}
