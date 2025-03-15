import { InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
  ReservedModels,
  ValidationKeys,
} from "@decaf-ts/decorator-validation";
import {
  HTML5InputTypes,
  UIKeys,
  ValidatableByAttribute,
  ValidatableByType,
} from "./constants";
import {
  FieldDefinition,
  UIElementMetadata,
  UIModelMetadata,
  UIPropMetadata,
} from "./types";
import { RenderingError } from "./errors";
import { Reflection } from "@decaf-ts/reflection";

export abstract class RenderingEngine<T = void, R = void> {
  private static cache: Record<
    string,
    | Constructor<RenderingEngine<unknown, unknown>>
    | RenderingEngine<unknown, unknown>
  > = {};
  private static current:
    | Constructor<RenderingEngine<unknown, unknown>>
    | RenderingEngine<unknown, unknown>;

  protected initialized: boolean = false;

  protected constructor(readonly flavour: string) {
    RenderingEngine.register(this);
    console.log(`decaf's ${flavour} rendering engine loaded`);
  }

  abstract initialize(...args: any[]): Promise<void>;

  translate(key: string, toView = true): string {
    if (toView) {
      switch (key) {
        case ReservedModels.STRING:
          return HTML5InputTypes.TEXT;
        case ReservedModels.NUMBER:
        case ReservedModels.BIGINT:
          return HTML5InputTypes.NUMBER;
        case ReservedModels.BOOLEAN:
          return HTML5InputTypes.CHECKBOX;
        case ReservedModels.DATE:
          return HTML5InputTypes.DATE;
      }
    } else {
      switch (key) {
        case HTML5InputTypes.TEXT:
        case HTML5InputTypes.EMAIL:
        case HTML5InputTypes.COLOR:
        case HTML5InputTypes.PASSWORD:
        case HTML5InputTypes.TEL:
        case HTML5InputTypes.URL:
          return ReservedModels.STRING;
        case HTML5InputTypes.NUMBER:
          return ReservedModels.NUMBER;
        case HTML5InputTypes.CHECKBOX:
          return ReservedModels.BOOLEAN;
        case HTML5InputTypes.DATE:
        case HTML5InputTypes.DATETIME_LOCAL:
        case HTML5InputTypes.TIME:
          return ReservedModels.DATE;
      }
    }
    return key;
  }

  /**
   * @description Converts a model to a field definition, processing UI decorators and validation rules.
   *
   * @summary This method extracts UI-related metadata from the model, including class-level decorators
   * and property-level decorators. It processes both UI properties and UI elements, applying
   * validation rules where applicable.
   *
   * @template M - Type extending Model
   * @param {M} model - The model instance to convert to a field definition
   * @param {Record<string, unknown>} [globalProps={}] - Global properties to be applied to all child elements
   * @returns {FieldDefinition<T>} A field definition object representing the UI structure of the model
   * @throws {RenderingError} If no UI definitions are set for the model or if there are invalid decorators
   */
  protected toFieldDefinition<M extends Model>(
    model: M,
    globalProps: Record<string, unknown> = {}
  ): FieldDefinition<T> {
    const classDecorator: UIModelMetadata =
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UIMODEL),
        model.constructor
      ) ||
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UIMODEL),
        Model.get(model.constructor.name) as any
      );

    if (!classDecorator)
      throw new RenderingError(
        `No ui definitions set for model ${model.constructor.name}. Did you use @uimodel?`
      );

    const { tag, props } = classDecorator;

    const uiDecorators: Record<string, DecoratorMetadata[]> =
      Reflection.getAllPropertyDecorators(model, UIKeys.REFLECT) as Record<
        string,
        DecoratorMetadata[]
      >;
    let children: FieldDefinition<T>[] | undefined;
    const childProps: Record<string, any> = {};

    if (uiDecorators) {
      const validationDecorators: Record<string, DecoratorMetadata[]> =
        Reflection.getAllPropertyDecorators(
          model,
          ValidationKeys.REFLECT
        ) as Record<string, DecoratorMetadata[]>;

      for (const key in uiDecorators) {
        const decs = uiDecorators[key];
        if (decs.length !== 2)
          throw new RenderingError(
            `Only one type of decoration is allowed. Please choose between @uiprop and @uielement`
          );
        const dec = decs[1]; // Ignore 0, its the design:type
        if (!dec) throw new RenderingError(`No decorator found`);
        switch (dec.key) {
          case UIKeys.PROP:
            childProps[key] = dec.props as UIPropMetadata;
            break;
          case UIKeys.ELEMENT: {
            children = children || [];
            const childDefinition: FieldDefinition<T> = {
              tag: (dec.props as UIElementMetadata).tag,
              props: Object.assign(
                {},
                (dec.props as UIElementMetadata).props as any,
                globalProps
              ),
            };

            const validationDecs: DecoratorMetadataObject[] =
              validationDecorators[key] as DecoratorMetadataObject[];

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const typeDec: DecoratorMetadataObject =
              validationDecs.shift() as DecoratorMetadataObject;
            for (const dec of validationDecs) {
              if ((dec.key as string) in ValidatableByAttribute) {
                childProps[this.translate(key)] = dec.props;
                continue;
              }
              if ((dec.key as string) in ValidatableByType) {
                childProps[UIKeys.TYPE] = dec.props;
                continue;
              }
              console.log(dec);
            }

            children.push(childDefinition);
            break;
          }
          default:
            throw new RenderingError(`Invalid key: ${dec.key}`);
        }
      }
    }

    return {
      tag: tag,
      props: Object.assign({}, props, globalProps),
      children: children,
    } as FieldDefinition<T>;
  }

  /**
   * Renders a model with global properties and additional arguments.
   * This abstract method should be implemented by subclasses to define specific rendering behavior.
   *
   * @abstract
   * @template M - Type extending Model
   * @template R - Rendering engine implementation specific output type
   * @param {M} model - The model to be rendered
   * @param {Record<string, unknown>} globalProps - Global properties to be applied to all elements during rendering
   * @param {...any[]} args - Additional arguments that may be required for specific rendering implementations
   * @returns {R} The rendered result, type depends on the specific implementation
   */
  abstract render<M extends Model>(
    model: M,
    globalProps: Record<string, unknown>,
    ...args: any[]
  ): R;

  static register(engine: RenderingEngine<unknown>) {
    if (engine.flavour in this.cache)
      throw new InternalError(
        `Rendering engine under ${engine.flavour} already exists`
      );
    this.cache[engine.flavour] = engine;
    this.current = engine;
  }

  private static getOrBoot<O>(
    obj: Constructor<RenderingEngine<O>> | RenderingEngine<O>
  ): RenderingEngine<O> {
    if (obj instanceof RenderingEngine) return obj as RenderingEngine<O>;
    const engine: RenderingEngine<O> = new obj();
    engine.initialize(); // make the booting async. use the initialized flag to control it
    return engine as RenderingEngine<O>;
  }

  static get<O>(flavour?: string): RenderingEngine<O> {
    if (!flavour)
      return this.getOrBoot<O>(
        this.current as Constructor<RenderingEngine<O>> | RenderingEngine<O>
      );
    if (!(flavour in this.cache))
      throw new InternalError(
        `Rendering engine under ${flavour} does not exist`
      );
    return this.getOrBoot<O>(
      this.cache[flavour] as
        | Constructor<RenderingEngine<O>>
        | RenderingEngine<O>
    );
  }

  static render<M extends Model>(model: M, ...args: any[]): any {
    const constructor = Model.get(model.constructor.name);
    if (!constructor) throw new InternalError("No model registered found");
    const flavour = Reflect.getMetadata(
      RenderingEngine.key(UIKeys.RENDERED_BY),
      constructor as ModelConstructor<Model>
    );
    // @ts-ignore
    return RenderingEngine.get(flavour).render(model, ...args);
  }

  static key(key: string) {
    return `${UIKeys.REFLECT}${key}`;
  }
}
