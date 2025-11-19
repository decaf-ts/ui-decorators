/**
 * @description Module that extends the Model prototype with rendering capabilities
 * @summary Adds the render method to all Model instances from decorator-validation
 * This module implements the Renderable interface for the Model class by adding a render method
 * to its prototype. This allows any Model instance to be rendered using the RenderingEngine.
 * @module model/overrides
 * @memberOf module:ui-decorators/model
 */

import { Model } from "@decaf-ts/decorator-validation";
import { RenderingEngine } from "../ui/Rendering";
import { Constructor, DecorationKeys, Metadata } from "@decaf-ts/decoration";
import {
  CrudOperationKeys,
  getUIAttributeKey,
  RenderingError,
  UIElementMetadata,
  UIKeys,
  UIModelMetadata,
} from "../ui/index";
import "./model";

/**
 * @description Renders the model using the appropriate rendering engine
 * @summary Delegates rendering to the RenderingEngine based on model metadata
 * This method implements the render method from the Renderable interface for all Model instances.
 * It uses the RenderingEngine to determine how to render the model based on its metadata.
 *
 * @template M Type of the model being rendered
 * @param {any[]} args Additional arguments to pass to the rendering engine
 * @return {any} The rendered output in the format determined by the rendering engine
 */
Model.prototype.render = function <M extends Model>(this: M, ...args: any[]) {
  return RenderingEngine.render(this, ...args);
};

(Model as any).renderedBy = function <M extends Model>(
  model: Constructor<M>
): string | undefined {
  return Metadata.get(model, Metadata.key(UIKeys.REFLECT, UIKeys.RENDERED_BY));
}.bind(Model);

(Model as any).uiPropertiesOf = function <M extends Model>(
  model: Constructor<M>
): string[] | undefined {
  const meta = Metadata.get(
    model,
    Metadata.key(UIKeys.REFLECT, DecorationKeys.PROPERTIES)
  );
  if (!meta) return undefined;
  return Object.keys(meta);
}.bind(Model);

(Model as any).uiDecorationOf = function <M extends Model>(
  model: Constructor<M>,
  prop: string,
  key?: string
): any {
  const meta = Metadata.get(
    model,
    Metadata.key(UIKeys.REFLECT, DecorationKeys.PROPERTIES, prop)
  );
  if (!meta) return undefined;
  if (!key) return meta;
  return meta[key];
};

(Model as any).uiModelOf = function <M extends Model>(
  model: Constructor<M>
): UIModelMetadata {
  return Metadata.get(model, Metadata.key(UIKeys.REFLECT, UIKeys.UIMODEL));
};

(Model as any).uiElementOf = function <M extends Model>(
  model: Constructor<M>,
  prop: string
): UIElementMetadata | undefined {
  return Metadata.get(model, getUIAttributeKey(prop, UIKeys.ELEMENT));
};

(Model as any).uiListModelOf = function <M extends Model>(
  model: Constructor<M>
): UIModelMetadata {
  return Metadata.get(model, Metadata.key(UIKeys.REFLECT, UIKeys.UILISTMODEL));
};

(Model as any).uiHandlersFor = function <M extends Model>(
  model: Constructor<M>
): UIModelMetadata {
  return Metadata.get(model, Metadata.key(UIKeys.REFLECT, UIKeys.HANDLERS));
};

(Model as any).uiLayoutOf = function <M extends Model>(
  model: Constructor<M>
): UIModelMetadata {
  return Metadata.get(model, Metadata.key(UIKeys.REFLECT, UIKeys.UILAYOUT));
};

(Model as any).uiIsHidden = function <M extends Model>(
  model: Constructor<M>,
  prop: string
): boolean {
  return !!Metadata.get(model, getUIAttributeKey(prop, UIKeys.HIDDEN));
};

(Model as any).uiIsHiddenOn = function <M extends Model>(
  model: Constructor<M>,
  prop: string,
  op?: CrudOperationKeys
): CrudOperationKeys[] | boolean {
  const meta = Metadata.get(model, getUIAttributeKey(prop, UIKeys.HIDDEN));
  if (!meta) return false;
  if (!op) return meta as CrudOperationKeys[];
  return (meta as CrudOperationKeys[]).includes(op);
};

(Model as any).uiTypeOf = function <M extends Model>(
  model: Constructor<M>,
  prop: string
): UIModelMetadata {
  const meta = Metadata.get(
    model,
    Metadata.key(UIKeys.REFLECT, DecorationKeys.PROPERTIES, prop)
  );
  if (!meta)
    throw new RenderingError(
      `No metadata found for property '${prop}' on model '${model.name}'`
    );
  const keys = Object.keys(meta).filter((k) =>
    [UIKeys.PROP, UIKeys.ELEMENT, UIKeys.CHILD].includes(k)
  );
  if (keys.length === 0)
    throw new RenderingError(
      `No UI type metadata found for property '${prop}' on model '${model.name}'`
    );
  if (keys.length > 1)
    throw new RenderingError(
      `Only one type of decoration is allowed. Please choose between @uiprop, @uichild or @uielement`
    );
  return meta[keys[0]];
};
//
// (Metadata as any).uiElements = function <M extends Model>(
//   model: Constructor<M>
// ): string[] | undefined {
//   const props = Metadata.uiPropertiesOf(model);
//   if (!props) return undefined;
//   return props
//     .map((prop) => Metadata.get(model, getUIAttributeKey(prop, UIKeys.ELEMENT)))
//     .filter(Boolean);
// }.bind(Model);

(Model as any).uiListItems = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>
): string[] | undefined {
  const meta = Metadata.get(
    model,
    Metadata.key(UIKeys.REFLECT, DecorationKeys.PROPERTIES)
  );
  if (!meta) return undefined;
  return Object.keys(meta);
}.bind(Model);
