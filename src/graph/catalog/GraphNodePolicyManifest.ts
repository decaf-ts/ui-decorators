export interface GraphNodePolicyManifest {
  allowManualTrigger?: "always" | "never" | "partial";
  allowRetry?: boolean;
  maxRetries?: number;
  allowCancel?: boolean;
  timeoutMs?: number;
  concurrency?: number;
  inputMode?: GraphNodePolicyInputMode;
}

export type GraphNodePolicyInputMode = "any" | "single" | "multiple";

export function isGraphNodePolicyManifest(value: unknown): value is GraphNodePolicyManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const mode = (value as Record<string, unknown>)["inputMode"];
  return mode === undefined || mode === "any" || mode === "single" || mode === "multiple";
}
