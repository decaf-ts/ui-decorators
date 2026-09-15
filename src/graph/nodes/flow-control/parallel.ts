/**
 * @module ui-decorators/graph/nodes/flow-control/parallel
 * @summary Parallel flow-control node declaration (DECAF-32 §22.2.2).
 * @description Parallel — splits execution into concurrent branches.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.parallel", {
  kind: "core.flow.parallel",
  category: "Flow Control",
  color: "#06b6d4",
  icon: "ti-arrows-vertical",
  width: 96,
  height: 96,
  labels: ["flow", "parallel", "concurrent"],
  metadata: {
    title: "Parallel",
    description: "Splits execution into concurrent branches. All branches run in parallel and outputs are collected.",
    branchCount: 2,
  },
})
@model()
export class ParallelFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to fan out" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Branches", placeholder: "Collected branch outputs" })
  @output({ handle: "branches" })
  branches!: unknown[];
}
