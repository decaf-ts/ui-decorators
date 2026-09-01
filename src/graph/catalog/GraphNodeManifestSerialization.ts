import { ValidationError } from "@decaf-ts/db-decorators";
import type { GraphJsonValue } from "../document/GraphJsonValue";
import { isGraphJsonSafeValue, cloneGraphJsonValue } from "../document/GraphJsonValue";
import type { GraphNodeManifest } from "./GraphNodeManifest";
import { isGraphNodeManifest } from "./GraphNodeManifest";

export function assertGraphNodeManifestSerializable(
  manifest: GraphNodeManifest
): void {
  if (!isGraphNodeManifest(manifest)) {
    throw new ValidationError(
      "Graph node manifest does not conform to the required shape"
    );
  }
  if (!isGraphJsonSafeValue(manifest)) {
    throw new ValidationError(
      "Graph node manifest contains values that are not JSON-safe: functions, class instances, undefined, NaN/Infinity, symbol keys or unsafe prototype keys are not allowed on manifests"
    );
  }
}

export function serializeGraphNodeManifest(
  manifest: GraphNodeManifest
): Record<string, GraphJsonValue> {
  assertGraphNodeManifestSerializable(manifest);
  return cloneGraphJsonValue(
    manifest as unknown as GraphJsonValue
  ) as Record<string, GraphJsonValue>;
}

export function deserializeGraphNodeManifest(
  serialized: Record<string, GraphJsonValue>
): GraphNodeManifest {
  if (!isGraphNodeManifest(serialized)) {
    throw new ValidationError(
      "Serialized graph node manifest does not conform to the required shape"
    );
  }
  return cloneGraphJsonValue(serialized as unknown as GraphJsonValue) as unknown as GraphNodeManifest;
}

export function graphNodeManifestSerializer(manifest: GraphNodeManifest): string {
  assertGraphNodeManifestSerializable(manifest);
  try {
    return JSON.stringify(manifest, null, 2);
  } catch (e) {
    throw new ValidationError(
      `Cannot serialize graph node manifest '${manifest.kind}': ${String(e)}`
    );
  }
}

export function graphNodeManifestDeserializer(serialised: string): GraphNodeManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialised);
  } catch (e) {
    throw new ValidationError(
      `Serialized graph node manifest is not valid JSON: ${String(e)}`
    );
  }
  assertGraphNodeManifestSerializable(parsed as GraphNodeManifest);
  return parsed as GraphNodeManifest;
}
