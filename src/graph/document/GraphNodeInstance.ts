import type { GraphInputBinding, GraphOutputBinding } from "./GraphNodeBinding";
import type { GraphJsonValue } from "./GraphJsonValue";
import type { GraphLoopConfiguration } from "./GraphLoopConfiguration";
import type { GraphNodeUiState } from "./GraphWorkflowUiState";

export interface GraphNodeInstance {
  id: string;
  kind: string;
  label?: string;
  parameters: Record<string, GraphJsonValue>;
  inputBindings?: Record<string, GraphInputBinding>;
  outputBindings?: Record<string, GraphOutputBinding>;
  disabled?: boolean;
  metadata?: Record<string, GraphJsonValue>;
  loop?: GraphLoopConfiguration;
  ui?: GraphNodeUiState;
}
