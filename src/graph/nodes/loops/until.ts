/**
 * @module ui-decorators/graph/nodes/loops/until
 * @summary Until loop node declaration.
 * @description Shared declaration for the `core.loop.until` system node kind
 * (decorator id `graph-until-loop-node`), ported from the for-angular demo
 * app so the loop kinds become shared canvas nodes. Its executor is built
 * into the integrations engine (`UntilGraphNodeExecutor`). The loop-body
 * workflow is demo/app-side content and is not part of the shared
 * declaration — the shared class carries the port/metadata shape only.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node('graph-until-loop-node', {
  kind: 'core.loop.until',
  category: 'Loop',
  color: '#db2777',
  icon: 'ti-player-stop',
  width: 96,
  height: 96,
  labels: ['loop', 'conditional', 'until'],
  metadata: {
    title: 'Until loop',
    description: 'Repeats the body until the condition is true (post-condition, runs at least once).',
    loop: {
      maxIterations: 50,
      statePort: 'state',
      condition: {
        type: 'greaterThanOrEqual' as never,
        left: 'iteration',
        right: 2,
      },
    },
  },
})
@model()
export class GraphUntilLoopNode extends Model {
  @required()
  @uielement('input', { label: 'State', placeholder: 'Initial state' })
  @input({ handle: 'state' })
  state!: unknown;

  @required()
  @uielement('input', { label: 'Final state', placeholder: 'Final state after loop' })
  @output({ handle: 'state' })
  stateOut!: unknown;
}
