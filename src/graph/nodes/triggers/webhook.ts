/**
 * @module ui-decorators/graph/nodes/triggers/webhook
 * @summary Webhook trigger node declaration (DECAF-32 §22.2.1).
 * @description Webhook trigger — HTTP request received; path/method/auth/
 * responseMode config.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.trigger.webhook", {
  kind: "core.trigger.webhook",
  category: "Trigger",
  color: "#0ea5e9",
  icon: "ti-webhook",
  width: 96,
  height: 96,
  labels: ["trigger", "webhook", "http"],
  metadata: {
    title: "Webhook trigger",
    description: "Starts the workflow when an HTTP request is received on the configured path and method.",
    trigger: {
      type: "webhook",
      path: "/webhook",
      method: "POST",
      auth: "none",
      responseMode: "onReceived",
    },
  },
})
@model()
export class WebhookTriggerNode extends Model {
  @required()
  @uielement("textarea", { label: "Request payload", placeholder: "Webhook request body" })
  @output({ handle: "payload" })
  payload!: unknown;
}
