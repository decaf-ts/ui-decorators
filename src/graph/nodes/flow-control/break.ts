/**
 * @module ui-decorators/graph/nodes/flow-control/break
 * @summary Break flow-control node declaration (DECAF-32 §22.2.2).
 * @description Break — breaks out of the enclosing loop (foreach/while/until).
 * When executed inside a loop body, the loop terminates early and the loop's
 * `completed`/`state` output carries the results collected so far. The Break
 * node executor throws a `GraphBreakSignal` that the enclosing loop executor
 * catches.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.break", {
  kind: "core.flow.break",
  category: "Flow Control",
  color: "#ef4444",
  icon: "ti-square-arrow-right",
  width: 96,
  height: 96,
  labels: ["flow", "break", "loop", "control"],
  metadata: {
    title: "Break",
    description: "Breaks out of the enclosing loop. The loop terminates early and returns the results collected so far.",
  },
})
@model()
export class BreakFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Value", placeholder: "Value to forward (collected as the last partial result)" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @output({ handle: "broken" })
  broken!: unknown;
}
