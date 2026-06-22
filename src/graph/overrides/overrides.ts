import "./Rendering";
import { type FieldDefinition, RenderingEngine } from "../../ui/index";
import { Model } from "@decaf-ts/decorator-validation";
import { graphDefinitionOf } from "../reader";

(RenderingEngine.prototype as any).renderAsNode = function renderAsNode<
  M extends Model,
  T = void,
  R = FieldDefinition<T>,
>(model: M, globalProps: Record<string, unknown>, ...args: any[]): R {
  void globalProps;
  void args;
  return graphDefinitionOf(model) as unknown as R;
};
