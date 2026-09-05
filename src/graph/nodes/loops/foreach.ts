/**
 * @module ui-decorators/graph/nodes/loops/foreach
 * @summary Foreach loop node declaration.
 * @description Shared declaration for the `core.loop.foreach` system node
 * kind (decorator id `graph-foreach-loop-node`), ported from the for-angular
 * demo app so the loop kinds become shared canvas nodes. Its executor is
 * built into the integrations engine (`ForeachGraphNodeExecutor`). The
 * loop-body workflow is demo/app-side content and is not part of the shared
 * declaration — the shared class carries the port/metadata shape only.
 */
import { Model, model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import { connection, input, node, output } from "../../decorators";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node('graph-foreach-loop-node', {
  kind: 'core.loop.foreach',
  category: 'Loop',
  color: '#eab308',
  icon: 'ti-repeat',
  width: 120,
  height: 140,
  labels: ['loop', 'iteration', 'foreach'],
  metadata: {
    title: 'Foreach loop',
    description: 'Iterates over an array input and executes the body once per item (or per slice of items).',
    loop: {
      maxIterations: 100,
      itemPort: 'item',
      resultPort: 'result',
      slice: 1,
    },
  },
})
@model()
export class GraphForeachLoopNode extends Model {
  @required()
  @uielement('textarea', { label: 'Items', placeholder: 'Array to iterate over' })
  @input({ handle: 'items' })
  items!: unknown[];

  @required()
  @uielement('input', { label: 'Slice size', placeholder: 'Items per iteration (default 1)' })
  @input({ handle: 'slice' })
  slice!: number;

  @required()
  @output({ handle: 'item' })
  item!: unknown;

  @required()
  @connection({ handle: 'loop', connectionRules: { allowSelf: true, maxConnections: 1 } })
  loop!: unknown;

  @required()
  @output({ handle: 'completed' })
  completed!: unknown[];
}
