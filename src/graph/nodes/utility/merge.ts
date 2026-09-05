/**
 * @module ui-decorators/graph/nodes/utility/merge
 * @summary Merge utility node declaration (DECAF-32 §22.2.2).
 * @description Merge — normalises branch/parallel outputs into a single
 * output.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.merge", {
  kind: "core.flow.merge",
  category: "Utility",
  color: "#0d9488",
  icon: "ti-arrows-merge",
  width: 96,
  height: 96,
  labels: ["flow", "merge", "join"],
  metadata: {
    title: "Merge",
    description: "Merges multiple branch outputs into a single normalised output object.",
    strategy: "concat",
  },
})
@model()
export class MergeFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Branch outputs", placeholder: "Outputs to merge" })
  @input({ handle: "values" })
  values!: unknown[];

  @required()
  @uielement("input", { label: "Merged output", placeholder: "Merged result" })
  @output({ handle: "merged" })
  merged!: unknown;
}
