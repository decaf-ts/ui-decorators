import { DBKeys, InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
  ValidationKeys,
} from "@decaf-ts/decorator-validation";
import { UIKeys, ValidatableByAttribute, ValidatableByType } from "./constants";
import {
  FieldDefinition,
  UIElementMetadata,
  UIModelMetadata,
  UIPropMetadata,
} from "./types";
import { RenderingError } from "./errors";
import { getAllPropertyDecorators } from "@decaf-ts/reflection";

export abstract class RenderingEngine<T = void> {
  private static cache: Record<
    string,
    Constructor<RenderingEngine<unknown>> | RenderingEngine<unknown>
  > = {};
  private static current:
    | Constructor<RenderingEngine<unknown>>
    | RenderingEngine<unknown>;

  protected initialized: boolean = false;

  protected constructor(readonly flavour: string) {
    RenderingEngine.register(this);
  }

  abstract initialize(...args: any[]): Promise<void>;

  protected translate(key: string): string {
    switch (key) {
      // case UIKeys.MAX_LENGTH:
      //   return "maxLength";
      // case UIKeys.MIN_LENGTH:
      //   return 'minLength';
      default:
        return key;
    }
  }

  render<M extends Model>(model: M, ...args: any[]): FieldDefinition<T> {
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
      getAllPropertyDecorators(model, UIKeys.REFLECT) as Record<
        string,
        DecoratorMetadata[]
      >;
    let children: FieldDefinition<T>[] | undefined;
    const childProps: Record<string, any> = {};

    if (uiDecorators) {
      const validationDecorators: Record<string, DecoratorMetadata[]> =
        getAllPropertyDecorators(model, ValidationKeys.REFLECT) as Record<
          string,
          DecoratorMetadata[]
        >;
      const dbDecorators: Record<string, DecoratorMetadata[]> =
        getAllPropertyDecorators(model, DBKeys.REFLECT) as Record<
          string,
          DecoratorMetadata[]
        >;

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
              props: (dec.props as UIElementMetadata).props as any,
            };

            const validationDecs: DecoratorMetadataObject[] =
              validationDecorators[key] as DecoratorMetadataObject[];

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
      props: Object.assign({}, childProps || {}, props),
      children: children,
    } as FieldDefinition<T>;
  }

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
    return this.get(flavour).render(model, ...args);
  }

  static key(key: string) {
    return `${UIKeys.REFLECT}${key}`;
  }
}
