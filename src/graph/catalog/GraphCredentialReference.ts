export interface GraphCredentialReference {
  credentialId: string;
  credentialType: string;
}

export function isGraphCredentialReference(value: unknown): value is GraphCredentialReference {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["credentialId"] === "string" &&
    typeof record["credentialType"] === "string"
  );
}

export { isGraphCredentialRequirement, type GraphCredentialRequirement } from "./GraphCredentialRequirement";
