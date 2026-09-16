/**
 * @module ui-decorators/graph/nodes/triggers/schedule
 * @summary Schedule trigger node declaration (DECAF-32 §22.2.1).
 * @description Schedule trigger — cron-like schedule; timezone + payload
 * config.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.trigger.schedule", {
  kind: "core.trigger.schedule",
  category: "Trigger",
  color: "#3b82f6",
  icon: "ti-calendar-time",
  width: 96,
  height: 96,
  labels: ["trigger", "schedule", "cron"],
  metadata: {
    title: "Schedule trigger",
    description: "Starts the workflow on a cron-like schedule with timezone support.",
    trigger: {
      type: "schedule",
      schedule: "0 * * * *",
      timezone: "UTC",
    },
  },
})
@model()
export class ScheduleTriggerNode extends Model {
  @required()
  @uielement("textarea", { label: "Scheduled payload", placeholder: "Payload for the scheduled run" })
  @output({ handle: "payload" })
  payload!: unknown;
}
