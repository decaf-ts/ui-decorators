/**
 * @module ui-decorators/graph/nodes/triggers/manual
 * @summary Manual trigger node declaration (DECAF-32 §22.2.1).
 * @description Manual trigger — user clicks Run; input form generated from
 * `inputSchema`. Triggers are metadata-only entrypoints: they define how a
 * workflow starts and produce a trigger payload on their `@output` ports.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.trigger.manual", {
  kind: "core.trigger.manual",
  category: "Trigger",
  color: "#3b82f6",
  icon: "ti-hand-click",
  width: 96,
  height: 96,
  labels: ["trigger", "manual", "entrypoint"],
  metadata: {
    title: "Manual trigger",
    description: "Starts the workflow when the user clicks Run. The input form is generated from the trigger's input schema.",
    trigger: {
      type: "manual",
      inputSchema: {},
    },
  },
})
@model()
export class ManualTriggerNode extends Model {
  @required()
  @uielement("textarea", { label: "Trigger payload", placeholder: "Manual trigger payload" })
  @output({ handle: "payload" })
  payload!: unknown;
}
