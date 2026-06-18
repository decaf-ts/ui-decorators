export enum GraphKeys {
  GRAPH = "graph",
  NODE = `${GraphKeys.GRAPH}.node`,
  EDGE = `${GraphKeys.GRAPH}.edge`,
  PORT = `${GraphKeys.GRAPH}.port`,
}

export enum PortDirection {
  INPUT = "input",
  OUTPUT = "output",
}

export type GraphNodeKind = string;

export type GraphConnectionRule = {
  allowSelf?: boolean;
  allowMultiple?: boolean;
  allowedKinds?: GraphNodeKind[];
  blockedKinds?: GraphNodeKind[];
  group?: string;
  maxConnections?: number;
  metadata?: Record<string, unknown>;
};

export type GraphNodeMetadata = {
  kind?: GraphNodeKind;
  category?: string;
  color?: string;
  group?: string;
  height?: number;
  icon?: string;
  labels?: string[];
  maxChildren?: number;
  minWidth?: number;
  width?: number;
  connectionRules?: GraphConnectionRule;
  metadata?: Record<string, unknown>;
};

export type GraphPortMetadata = {
  direction: PortDirection;
  connectionRules?: GraphConnectionRule;
  visible?: boolean;
  handle?: string;
  metadata?: Record<string, unknown>;
};

export type GraphPortDefinition = {
  property: string;
  direction: PortDirection;
  name: string;
  label: string;
  type?: string;
  required: boolean;
  hidden: boolean;
  designType?: string;
  element?: Record<string, any>;
  prop?: Record<string, any>;
  validation?: Record<string, any>;
  graph?: GraphPortMetadata;
  connectionRules?: GraphConnectionRule;
};

export type GraphNodeDefinition = {
  name: string;
  tag: string;
  kind: GraphNodeKind;
  category?: string;
  color?: string;
  group?: string;
  height?: number;
  icon?: string;
  labels: string[];
  maxChildren?: number;
  minWidth?: number;
  width?: number;
  props?: Record<string, any>;
  ui?: Record<string, any>;
  graph?: GraphNodeMetadata;
  ports: GraphPortDefinition[];
};
