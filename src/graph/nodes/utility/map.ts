/**
 * @module ui-decorators/graph/nodes/utility/map
 * @summary Map utility node declaration (DECAF-32 §22.2.2).
 * @description Map — transforms the current input into a new output object.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.map", {
  kind: "core.flow.map",
  category: "Utility",
  color: "#84cc16",
  icon: "ti-arrows-right-left",
  width: 96,
  height: 96,
  labels: ["flow", "map", "transform"],
  metadata: {
    title: "Map",
    description: "Transforms the current input into a new output object using the configured mapper.",
    mapper: {},
  },
})
@model()
export class MapFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to transform" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Transformed output", placeholder: "Mapped result" })
  @output({ handle: "result" })
  result!: unknown;
}
