/**
 * @module ui-decorators/graph/nodes/utility/utility-log
 * @summary Utility Log node declaration (DECAF-48 §4.3).
 * @description Utility Log — logs the input value through the run's
 * `ctx.logger` at a configurable level and forwards it unchanged on the
 * `logged` output port.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";
import type { LogNodeLevel } from "../../types";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.utility.log", {
  kind: "core.utility.log",
  category: "Utility",
  color: "#6366f1",
  icon: "ti-terminal",
  width: 96,
  height: 96,
  labels: ["utility", "log", "debug", "observability"],
  metadata: {
    title: "Utility Log",
    description: "Logs the input value to the run's ctx.logger at a configurable level and forwards it unchanged.",
  },
})
@model()
export class UtilityLogNode extends Model {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to log" })
  @input({ handle: "value" })
  value!: unknown;

  @uielement("input", { label: "Log level", placeholder: "info, warn, error, ..." })
  level!: LogNodeLevel;

  @required()
  @uielement("input", { label: "Logged value", placeholder: "Forwarded value" })
  @output({ handle: "logged" })
  logged!: unknown;
}
