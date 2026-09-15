/**
 * @module ui-decorators/graph/nodes/utility/log
 * @summary Log utility node declaration (DECAF-32 §22.2.2).
 * @description Log — logs the input value and forwards it unchanged on the
 * `logged` output port. Useful for debugging, audit trails, and
 * discard/side-effect branches in a workflow.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.log", {
  kind: "core.flow.log",
  category: "Utility",
  color: "#6366f1",
  icon: "ti-terminal",
  width: 96,
  height: 96,
  labels: ["flow", "log", "debug", "utility"],
  metadata: {
    title: "Log",
    description: "Logs the input value to the execution logger and forwards it unchanged.",
  },
})
@model()
export class LogFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to log" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Logged value", placeholder: "Forwarded value" })
  @output({ handle: "logged" })
  logged!: unknown;
}
