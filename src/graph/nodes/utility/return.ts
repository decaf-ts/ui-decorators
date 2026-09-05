/**
 * @module ui-decorators/graph/nodes/utility/return
 * @summary Return utility node declaration (DECAF-32 §22.2.2).
 * @description Return — defines and normalises the final workflow output.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.return", {
  kind: "core.flow.return",
  category: "Utility",
  color: "#22c55e",
  icon: "ti-arrow-back-up",
  width: 96,
  height: 96,
  labels: ["flow", "return", "output"],
  metadata: {
    title: "Return",
    description: "Normalises the input into the final workflow output object.",
    outputSchema: {},
  },
})
@model()
export class ReturnFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to normalise" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Returned output", placeholder: "Normalised output" })
  @output({ handle: "result" })
  result!: unknown;
}
