/**
 * @module ui-decorators/graph/nodes/triggers/chat
 * @summary Chat trigger node declaration (DECAF-32 §22.2.1).
 * @description Chat trigger — chat message entrypoint; message/sessionId/
 * userId schema.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.trigger.chat", {
  kind: "core.trigger.chat",
  category: "Trigger",
  color: "#14b8a6",
  icon: "ti-message-circle",
  width: 96,
  height: 96,
  labels: ["trigger", "chat", "entrypoint"],
  metadata: {
    title: "Chat trigger",
    description: "Starts the workflow when a chat message is received. Emits message, sessionId, and userId.",
    trigger: {
      type: "chat",
    },
  },
})
@model()
export class ChatTriggerNode extends Model {
  @required()
  @uielement("input", { label: "Message", placeholder: "Incoming chat message" })
  @output({ handle: "message" })
  message!: string;

  @required()
  @uielement("input", { label: "Session ID", placeholder: "Chat session identifier" })
  @output({ handle: "sessionId" })
  sessionId!: string;

  @required()
  @uielement("input", { label: "User ID", placeholder: "Chat user identifier" })
  @output({ handle: "userId" })
  userId!: string;
}
