import { Renderable } from "./Renderable";
import { Constructor } from "@decaf-ts/decoration";
import {
  CrudOperationKeys,
  UIElementMetadata,
  UIHandlerMetadata,
  UILayoutMetadata,
  UIListModelMetadata,
  UIModelMetadata,
} from "../ui/index";

declare module "@decaf-ts/decorator-validation" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  declare interface Model extends Renderable {
    /**
     * @description Checks if a property of a model is itself a model or has a model type
     * @summary Determines whether a specific property of a model instance is either a model instance
     * or has a type that is registered as a model. This function is used for model serialization
     * and deserialization to properly handle nested models.
     * @template R the expected UI code according to each rendering engine
     * @param {any[]} args - optional engine specific args
     */
    render<R>(...args: any[]): R;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Model {
    function renderedBy<M extends Model>(
      model: Constructor<M>
    ): string | undefined;
    function uiPropertiesOf<M extends Model>(
      model: Constructor<M>
    ): string[] | undefined;
    function uiDecorationOf<M extends Model>(
      model: Constructor<M>,
      prop: keyof M,
      key?: string
    ): any;
    function uiModelOf<M extends Model>(
      model: Constructor<M>
    ): UIModelMetadata | undefined;
    function uiElementOf<M extends Model>(
      model: Constructor<M>,
      prop: keyof M
    ): UIElementMetadata | undefined;
    function uiListModelOf<M extends Model>(
      model: Constructor<M>
    ): UIListModelMetadata | undefined;
    function uiHandlersFor<M extends Model>(
      model: Constructor<M>
    ): UIHandlerMetadata | undefined;
    function uiLayoutOf<M extends Model>(
      model: Constructor<M>
    ): UILayoutMetadata | undefined;
    function uiTypeOf<M extends Model>(
      model: Constructor<M>,
      prop: keyof M
    ): UILayoutMetadata | undefined;
    function uiIsHidden<M extends Model>(
      model: Constructor<M>,
      prop: keyof M
    ): boolean;

    function uiHiddenOn<M extends Model>(
      model: Constructor<M>,
      prop: keyof M
    ): CrudOperationKeys[] | false;
    function uiHiddenOn<M extends Model>(
      model: Constructor<M>,
      prop: keyof M,
      op: CrudOperationKeys
    ): boolean;
    function uiHiddenOn<M extends Model>(
      model: Constructor<M>,
      prop: keyof M,
      op?: CrudOperationKeys
    ): CrudOperationKeys[] | boolean;
  }
}
