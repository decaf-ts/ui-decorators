/**
 * @module ui-decorators/graph/nodes/loops/while
 * @summary While loop node declaration.
 * @description Shared declaration for the `core.loop.while` system node kind
 * (decorator id `graph-while-loop-node`), ported from the for-angular demo
 * app so the loop kinds become shared canvas nodes. Its executor is built
 * into the integrations engine (`WhileGraphNodeExecutor`). The loop-body
 * workflow is demo/app-side content and is not part of the shared
 * declaration — the shared class carries the port/metadata shape only.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node('graph-while-loop-node', {
  kind: 'core.loop.while',
  category: 'Loop',
  color: '#0891b2',
  icon: 'ti-arrows-loop',
  width: 96,
  height: 96,
  labels: ['loop', 'conditional', 'while'],
  metadata: {
    title: 'While loop',
    description: 'Repeats the body while the condition is true (pre-condition).',
    loop: {
      maxIterations: 50,
      statePort: 'state',
      condition: {
        type: 'lessThan' as never,
        left: 'iteration',
        right: 3,
      },
    },
  },
})
@model()
export class GraphWhileLoopNode extends Model {
  @required()
  @uielement('input', { label: 'State', placeholder: 'Initial state' })
  @input({ handle: 'state' })
  state!: unknown;

  @required()
  @uielement('input', { label: 'Final state', placeholder: 'Final state after loop' })
  @output({ handle: 'state' })
  stateOut!: unknown;
}
