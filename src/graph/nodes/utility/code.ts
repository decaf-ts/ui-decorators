/**
 * @module ui-decorators/graph/nodes/utility/code
 * @summary Code utility node declaration (ALFRED-5 §7, DECAF-32 §22.4).
 * @description Code — sandboxed JS/TS code execution. The engine's
 * `CodeGraphNodeExecutor` delegates to the pluggable `CodeSandboxEvaluator`.
 * The default `IsolatedVmCodeSandboxEvaluator` (backed by `isolated-vm`)
 * enforces the Code Node restrictions: no imports, no requires, pure
 * functions only. The sandbox context exposes `$input`, `$vars`, `$item`,
 * `$index`, `$node`, and `$output` as data variables. TypeScript is
 * supported via transpilation.
 *
 * The `@input` on `CodeFlowNode.input` is a schema group — the nested
 * model's `@input` ports are spliced into the parent unprefixed. `code` has
 * `@input` + `@uielement("code-editor")`, so it appears as a port AND in the
 * CRUD modal (the only visible field). `data` has `@input` + `@hidden()` but
 * no `@uielement`, so it is a canvas-only port (for edge connections from
 * workflow input badges) but never appears in the CRUD modal. `language` has
 * no `@input` and no `@uielement`, so it is neither a port nor rendered — it
 * defaults to `"javascript"`.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { hidden, uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@model()
export class CodeInputSchema extends Model {
  @required()
  language: string = "javascript";

  @required()
  @uielement("code-editor", { label: "Code", placeholder: "// User-authored JS code" })
  @input({ handle: "code" })
  code!: string;

  @hidden()
  @input({ handle: "data" })
  data?: unknown;
}

@node("core.flow.code", {
  kind: "core.flow.code",
  category: "Utility",
  color: "#0d9488",
  icon: "ti-code",
  width: 96,
  height: 96,
  labels: ["flow", "code", "sandbox", "transform"],
  metadata: {
    title: "Code",
    description: "Runs user-authored JS/TS in a restricted VM sandbox. Supports placeholder syntax for workflow data references.",
    timeoutMs: 1000,
  },
})
@model()
export class CodeFlowNode extends Model {
  @required()
  @input({ handle: "input", model: CodeInputSchema })
  input!: CodeInputSchema;

  @required()
  @output({ handle: "result" })
  result!: unknown;
}
