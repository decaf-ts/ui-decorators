export const GRAPH_NODE_CAPABILITIES = [
  "trigger",
  "loop",
  "branching",
  "stateful",
  "retryable",
  "cancellable",
  "parallel",
  "resource",
] as const;

export type GraphNodeCapability = (typeof GRAPH_NODE_CAPABILITIES)[number];

export function isGraphNodeCapability(value: unknown): value is GraphNodeCapability {
  return (GRAPH_NODE_CAPABILITIES as readonly string[]).includes(value as string);
}

export function isGraphNodeCapabilityArray(value: unknown): value is GraphNodeCapability[] {
  return Array.isArray(value) && value.every(isGraphNodeCapability);
}
