/**
 * @module ui-decorators/graph/nodes/flow-control/switch
 * @summary Switch flow-control node declaration (DECAF-32 §22.2.2).
 * @description Switch — multi-branch. Routes the input to one of the case
 * output ports or `default` based on matching conditions. Each case defines
 * a `SwitchCaseCondition` (graphical or code mode) and a dedicated output
 * port. Cases are stored in `metadata.switch.cases` and the renderer creates
 * dynamic output ports from them (DECAF-32 §22.2.2).
 *
 * The node grows in height as cases are added. Each case gets its own
 * output port on the right side, labeled with the case label.
 */
import { model, required } from "@decaf-ts/decorator-validation";
import { uielement } from "../../../ui/decorators";
import {
  input,
  node,
  output,
} from "../../decorators";
import {
  PortDirection,
  type GraphPortDefinition,
} from "../../constants";
import { graphDefinitionOf } from "../../reader";
import type { NodeMetadataChange, SwitchNodeMetadata } from "../../types";
import { GraphNode } from "../base";

// Ensure category styles are registered (idempotent).
import "../category-styles";

@node("core.flow.switch", {
  kind: "core.flow.switch",
  category: "Flow Control",
  color: "#f97316",
  icon: "ti-arrows-shuffle",
  width: 120,
  height: 140,
  labels: ["flow", "switch", "multi-branch"],
  metadata: {
    title: "Switch",
    description: "Multi-branch switch. Routes the input to the first matching case output, or the default output.",
    switch: {
      cases: [],
      defaultPort: "default",
      hasDefault: false,
    },
  },
})
@model()
export class SwitchFlowNode extends GraphNode {
  @required()
  @uielement("textarea", { label: "Input value", placeholder: "Value to switch on" })
  @input({ handle: "value" })
  value!: unknown;

  @required()
  @uielement("input", { label: "Default", placeholder: "Default output when no case matches" })
  @output({ handle: "default" })
  default!: unknown;

  /**
   * Computes the node's ports, size, and data patch from the given switch
   * metadata. Each case gets its own output port on the right side; the
   * `default` port always renders **last** (DECAF-32 §21 port-ordering rule,
   * DECAF-34 §6.2). When `hasDefault` is `false`, the `default` output port
   * is omitted entirely. The node grows in height as cases are added.
   *
   * @param meta - The switch metadata patch (`metadata.switch`), carrying
   *   the cases and the optional default-port configuration.
   * @returns The computed {@link NodeMetadataChange}: reordered ports
   *   (case outputs inserted before the optional default), the grown size,
   *   and the `switchMetadata` data patch.
   */
  static override applyMetadata(meta: SwitchNodeMetadata): NodeMetadataChange {
    const definition = graphDefinitionOf(this as never);
    const defaultPortName = meta.defaultPort ?? "default";
    const hasDefault = meta.hasDefault === true;

    // Base ports excluding any port that collides with a case output port.
    const basePorts = definition.ports.filter(
      (p) => !meta.cases.some((c) => c.outputPort === p.property)
    );
    // Separate the default output port so it can be placed last (or omitted).
    const nonDefaultPorts = basePorts.filter(
      (p) => p.property !== defaultPortName
    );
    const defaultPort = basePorts.find((p) => p.property === defaultPortName);

    const casePorts: GraphPortDefinition[] = meta.cases.map((c) => ({
      property: c.outputPort,
      name: c.label,
      direction: PortDirection.OUTPUT,
      label: c.label,
      required: false,
      hidden: false,
      path: c.outputPort,
    }));

    // Port order: inputs/non-default outputs first, case outputs next, default last.
    const ports = [...nonDefaultPorts, ...casePorts];
    if (hasDefault && defaultPort) {
      ports.push(defaultPort);
    }

    const caseCount = meta.cases.length;
    return {
      ports,
      size: {
        width: definition.width ?? 120,
        height: caseCount > 0 ? 140 + caseCount * 24 : definition.height ?? 140,
      },
      dataPatch: { switchMetadata: meta },
    };
  }
}
