export interface GraphConnectionPolicy {
  allowSelf?: boolean;
  allowMultiple?: boolean;
  allowedNodeKinds?: string[];
  blockedNodeKinds?: string[];
  allowedPortCategories?: string[];
  maxConnections?: number;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

export function isGraphConnectionPolicy(value: unknown): value is GraphConnectionPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    (record["allowedNodeKinds"] === undefined || isStringArray(record["allowedNodeKinds"])) &&
    (record["blockedNodeKinds"] === undefined || isStringArray(record["blockedNodeKinds"])) &&
    (record["allowedPortCategories"] === undefined ||
      isStringArray(record["allowedPortCategories"])) &&
    (record["maxConnections"] === undefined ||
      (typeof record["maxConnections"] === "number" &&
        Number.isFinite(record["maxConnections"] as number)))
  );
}
