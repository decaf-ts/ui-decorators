/**
 * @module ui-decorators/graph/nodes/flow-control/error-boundary
 * @summary Error-boundary flow-control node declaration (DECAF-32 §22.2.2).
 * @description Error boundary — try/catch/finally workflow behaviour.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.errorBoundary", {
  kind: "core.flow.errorBoundary",
  category: "Flow Control",
  color: "#ef4444",
  icon: "ti-shield-check",
  width: 96,
  height: 96,
  labels: ["flow", "error", "try-catch"],
  metadata: {
    title: "Error boundary",
    description: "Wraps the input in a try/catch/finally. Emits the result on success, or the error on failure.",
    finally: false,
  },
})
@model()
export class ErrorBoundaryFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to guard" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Result", placeholder: "Output on success" })
  @output({ handle: "result" })
  result!: unknown;

  @required()
  @uielement("input", { label: "Error", placeholder: "Output on failure" })
  @output({ handle: "error" })
  error!: unknown;
}
