import type { FieldDefinition } from "../../ui/types";
import type { Model } from "@decaf-ts/decorator-validation";

export interface RenderingEngine<T = void, R = FieldDefinition<T>> {
  renderAsNode<M extends Model>(
    model: M,
    globalProps: Record<string, unknown>,
    ...args: any[]
  ): R;
}
