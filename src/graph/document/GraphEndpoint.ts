export type GraphWorkflowEndpoint = {
  scope: "workflow";
  port: string;
};

export type GraphNodeEndpoint = {
  scope: "node";
  nodeId: string;
  port: string;
};

export type GraphEndpoint = GraphWorkflowEndpoint | GraphNodeEndpoint;

export function isGraphWorkflowEndpoint(endpoint: GraphEndpoint): endpoint is GraphWorkflowEndpoint {
  return endpoint.scope === "workflow";
}

export function isGraphNodeEndpoint(endpoint: GraphEndpoint): endpoint is GraphNodeEndpoint {
  return endpoint.scope === "node";
}

export function isGraphEndpoint(value: unknown): value is GraphEndpoint {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (record["scope"] === "workflow") {
    return typeof record["port"] === "string" && Reflect.ownKeys(record).length === 2;
  }
  if (record["scope"] === "node") {
    return (
      typeof record["nodeId"] === "string" &&
      typeof record["port"] === "string" &&
      Reflect.ownKeys(record).length === 3
    );
  }
  return false;
}
