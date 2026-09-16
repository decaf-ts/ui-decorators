import type { GraphJsonValue } from "./GraphJsonValue";

export type GraphWorkflowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type GraphNodeUiState = {
  position: { x: number; y: number };
  size?: { width?: number; height?: number };
  /**
   * Explicit user resize flag (D1, DECAF-50 §4.5). Only a genuine user resize
   * sets this; a carried default or template CSS never wins over the manifest
   * display. `ui.size` is honoured by projection only when this is `true`.
   */
  resized?: boolean;
  /** Explicit user per-node colour override (D7, DECAF-50 §4.5), when any. */
  color?: string;
  expanded?: boolean;
  selectedTab?: string;
};

export type GraphEdgeUiState = {
  points?: Array<{ x: number; y: number }>;
};

export type GraphWorkflowUiState = {
  viewport?: GraphWorkflowViewport;
} & {
  [key: string]: GraphJsonValue | undefined;
};
