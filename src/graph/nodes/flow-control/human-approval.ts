/**
 * @module ui-decorators/graph/nodes/flow-control/human-approval
 * @summary Human-approval flow-control node declaration (DECAF-32 §22.2.2).
 * @description Human approval — suspends execution until a human approves
 * or rejects.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.humanApproval", {
  kind: "core.flow.humanApproval",
  category: "Flow Control",
  color: "#d946ef",
  icon: "ti-user-check",
  width: 96,
  height: 96,
  labels: ["flow", "approval", "suspend"],
  metadata: {
    title: "Human approval",
    description: "Suspends execution until a human approves or rejects. Emits the approved value or a rejection.",
    approvers: [],
    timeoutMs: 86400000,
  },
})
@model()
export class HumanApprovalFlowNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value pending approval" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Approved", placeholder: "Output when approved" })
  @output({ handle: "approved" })
  approved!: unknown;

  @required()
  @uielement("input", { label: "Rejected", placeholder: "Output when rejected" })
  @output({ handle: "rejected" })
  rejected!: unknown;
}
