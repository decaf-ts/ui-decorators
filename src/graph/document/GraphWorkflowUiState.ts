import type { GraphJsonValue } from "./GraphJsonValue";

export type GraphWorkflowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type GraphNodeUiState = {
  position: { x: number; y: number };
  size?: { width?: number; height?: number };
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
