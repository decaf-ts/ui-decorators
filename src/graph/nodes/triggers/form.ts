/**
 * @module ui-decorators/graph/nodes/triggers/form
 * @summary Form trigger node declaration (DECAF-32 §22.2.1).
 * @description Form trigger — generated public/internal form; field
 * definitions.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.trigger.form", {
  kind: "core.trigger.form",
  category: "Trigger",
  color: "#ec4899",
  icon: "ti-forms",
  width: 96,
  height: 96,
  labels: ["trigger", "form", "public"],
  metadata: {
    title: "Form trigger",
    description: "Starts the workflow when a generated form is submitted. Field definitions drive the form schema.",
    trigger: {
      type: "form",
      fields: [],
    },
  },
})
@model()
export class FormTriggerNode extends Model {
  @required()
  @uielement("textarea", { label: "Form submission", placeholder: "Form submission payload" })
  @output({ handle: "payload" })
  payload!: unknown;
}
