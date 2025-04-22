import { InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
  ReservedModels,
  ValidationKeys,
  ValidationMetadata,
} from "@decaf-ts/decorator-validation";
import { HTML5DateFormat, HTML5InputTypes, UIKeys } from "./constants";
import {
  FieldDefinition,
  FieldProperties,
  UIElementMetadata,
  UIModelMetadata,
  UIPropMetadata,
} from "./types";
import { RenderingError } from "./errors";
import { Reflection, DecoratorMetadata } from "@decaf-ts/reflection";
import { formatByType, generateUIModelID } from "./utils";

/**
 * @description Abstract class for rendering UI components based on model metadata.
 * @summary The RenderingEngine class provides a framework for converting model metadata into UI field definitions.
 * It handles the translation of model properties to UI elements, applies validation rules, and manages different rendering flavors.
 * This class is designed to be extended by specific rendering implementations.
 *
 * @template T The type of the rendering result, defaults to void
 * @template R The type of the field definition, defaults to FieldDefinition<T>
 *
 * @param {string} flavour - The flavor of the rendering engine.
 *
 * @class RenderingEngine
 */
export abstract class RenderingEngine<T = void, R = FieldDefinition<T>> {
  /**
   * @description Cache for storing rendering engine instances or constructors.
   * @private
   * @static
   */
  private static cache: Record<
    string,
    | Constructor<RenderingEngine<unknown, unknown>>
    | RenderingEngine<unknown, unknown>
  > = {};

  /**
   * @description The currently active rendering engine.
   * @private
   * @static
   */
  private static current:
    | Constructor<RenderingEngine<unknown, unknown>>
    | RenderingEngine<unknown, unknown>;

  /**
   * Flag indicating whether the rendering engine has been initialized.
   */
  protected initialized: boolean = false;

  protected constructor(readonly flavour: string) {
    RenderingEngine.register(this);
    console.log(`decaf's ${flavour} rendering engine loaded`);
  }

  /**
   * @description Initializes the rendering engine.
   * @summary Abstract method to be implemented by subclasses for specific initialization logic.
   *
   * @param {...any[]} args - Any additional arguments needed for initialization.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   *
   * @abstract
   */
  abstract initialize(...args: any[]): Promise<void>;

  /**
   * @description Translates between model types and HTML input types.
   * @summary Converts model data types to appropriate HTML input types and vice versa.
   *
   * @param {string} key - The key to translate.
   * @param {boolean} [toView=true] - Direction of translation (true for model to view, false for view to model).
   * @returns {string} The translated type.
   */
  translate(key: string, toView: boolean = true): string {
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
   * @description Checks if a type is validatable by its nature.
   * @summary Determines if a given UI key represents a type that is inherently validatable.
   *
   * @param {string} key - The UI key to check.
   * @returns {boolean} True if the type is validatable, false otherwise.
   */
  protected isValidatableByType(key: string): boolean {
    return new Set<string>([
      UIKeys.EMAIL,
      UIKeys.URL,
      UIKeys.DATE,
      UIKeys.PASSWORD,
    ]).has(key);
  }

  /**
   * @description Checks if a type is validatable by attribute.
   * @summary Determines if a given UI key represents a validation that can be applied as an attribute.
   *
   * @param {string} key - The UI key to check.
   * @returns {boolean} True if the type is validatable by attribute, false otherwise.
   */
  protected isValidatableByAttribute(key: string): boolean {
    return new Set<string>([
      UIKeys.REQUIRED,
      UIKeys.MIN,
      UIKeys.MAX,
      UIKeys.STEP,
      UIKeys.MIN_LENGTH,
      UIKeys.MAX_LENGTH,
      UIKeys.PATTERN,
    ]).has(key);
  }

  /**
   * @description Converts validation metadata to an attribute value.
   * @summary Transforms validation metadata into a value suitable for use as an HTML attribute.
   *
   * @param {string} key - The validation key.
   * @param {ValidationMetadata} value - The validation metadata.
   * @returns {string | number | boolean} The converted attribute value.
   */
  protected toAttributeValue(
    key: string,
    value: ValidationMetadata
  ): string | number | boolean {
    switch (key) {
      case UIKeys.MIN:
      case UIKeys.MAX:
      case UIKeys.MIN_LENGTH:
      case UIKeys.MAX_LENGTH:
      case UIKeys.STEP:
        return value.value;
      case UIKeys.EMAIL:
      case UIKeys.URL:
      case UIKeys.PATTERN:
      case UIKeys.PASSWORD:
        return value.pattern;
      default:
        return true;
    }
  }

  /**
   * @description Converts a model to a field definition.
   * @summary Processes a model instance, extracting UI-related metadata and validation rules to create a field definition.
   *
   * @template M Type extending Model
   * @template T Type referencing the specific Rendering engine field properties/inputs
   * @param {M} model - The model instance to convert.
   * @param {Record<string, unknown>} [globalProps={}] - Global properties to apply to all child elements.
   * @param {boolean} [generateId=true] - Flag indicating whether to populate the rendererId property.
   * @returns {FieldDefinition<T>} A field definition object representing the UI structure of the model.
   * @throws {RenderingError} If no UI definitions are set for the model or if there are invalid decorators.
   *
   * @mermaid
   * sequenceDiagram
   *  participant C as Client
   *  participant RE as RenderingEngine
   *  participant R as Reflection
   *  participant M as Model
   *  C->>RE: toFieldDefinition(model, globalProps)
   *  RE->>R: getMetadata(UIKeys.UIMODEL, model.constructor)
   *  R-->>RE: UIModelMetadata
   *  RE->>R: getAllPropertyDecorators(model, UIKeys.REFLECT)
   *  R-->>RE: Record<string, DecoratorMetadata[]>
   *  RE->>R: getAllPropertyDecorators(model, ValidationKeys.REFLECT)
   *  R-->>RE: Record<string, DecoratorMetadata<ValidationMetadata>[]>
   *  loop For each property
   *    RE->>RE: Process UI decorators
   *    RE->>RE: Apply validation rules
   *  end
   *  RE-->>C: FieldDefinition<T>
   */
  protected toFieldDefinition<M extends Model>(
    model: M,
    globalProps: Record<string, unknown> = {},
    generateId: boolean = true
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
    let children: FieldDefinition<Record<string, any>>[] | undefined;
    const childProps: Record<string, any> = {};

    if (uiDecorators) {
      const validationDecorators: Record<
        string,
        DecoratorMetadata<ValidationMetadata>[]
      > = Reflection.getAllPropertyDecorators(
        model,
        ValidationKeys.REFLECT
      ) as Record<string, DecoratorMetadata<ValidationMetadata>[]>;

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
            const childDefinition: FieldDefinition<Record<string, any>> = {
              tag: (dec.props as UIElementMetadata).tag,
              props: Object.assign(
                {},
                (dec.props as UIElementMetadata).props as any,
                globalProps
              ),
            };

            const validationDecs: DecoratorMetadata<ValidationMetadata>[] =
              validationDecorators[
                key
              ] as DecoratorMetadata<ValidationMetadata>[];

            const typeDec: DecoratorMetadataObject =
              validationDecs.shift() as DecoratorMetadata;
            for (const dec of validationDecs) {
              if (this.isValidatableByAttribute(dec.key)) {
                childDefinition.props[this.translate(dec.key)] =
                  this.toAttributeValue(dec.key, dec.props);
                continue;
              }
              if (this.isValidatableByType(dec.key)) {
                if (dec.key === HTML5InputTypes.DATE) {
                  childDefinition.props[UIKeys.FORMAT] =
                    dec.props.format || HTML5DateFormat;
                }
                childDefinition.props[UIKeys.TYPE] = dec.key;
                continue;
              }
              console.log(dec);
            }

            if (!childDefinition.props[UIKeys.TYPE]) {
              const basicType = (typeDec.props as { name: string }).name;
              childDefinition.props[UIKeys.TYPE] = this.translate(
                basicType.toLowerCase(),
                true
              );
            }

            childDefinition.props.value = formatByType(
              childDefinition.props[UIKeys.TYPE],
              model[key as keyof M],
              childDefinition.props[UIKeys.FORMAT]
            );

            children.push(childDefinition);
            break;
          }
          default:
            throw new RenderingError(`Invalid key: ${dec.key}`);
        }
      }
    }

    const result: FieldDefinition<T> = {
      tag: tag,
      props: Object.assign({}, props, globalProps) as T & FieldProperties,
      children: children as FieldDefinition<any>[],
    };

    if (generateId) {
      result.rendererId = generateUIModelID(model);
    }

    return result;
  }

  /**
   * @description Renders a model with global properties and additional arguments.
   * @summary Abstract method to be implemented by subclasses to define specific rendering behavior.
   *
   * @template M Type extending Model
   * @template R Rendering engine implementation specific output type
   * @param {M} model - The model to be rendered.
   * @param {Record<string, unknown>} globalProps - Global properties to be applied to all elements during rendering.
   * @param {...any[]} args - Additional arguments that may be required for specific rendering implementations.
   * @returns {R} The rendered result, type depends on the specific implementation.
   *
   * @abstract
   */
  abstract render<M extends Model>(
    model: M,
    globalProps: Record<string, unknown>,
    ...args: any[]
  ): R;

  /**
   * @description Registers a rendering engine instance.
   * @summary Adds a rendering engine to the static cache and sets it as the current engine.
   *
   * @param {RenderingEngine<unknown, unknown>} engine - The rendering engine to register.
   * @throws {InternalError} If an engine with the same flavor already exists.
   *
   * @static
   */
  static register(engine: RenderingEngine<unknown, unknown>) {
    if (engine.flavour in this.cache)
      throw new InternalError(
        `Rendering engine under ${engine.flavour} already exists`
      );
    this.cache[engine.flavour] = engine;
    this.current = engine;
  }

  /**
   * @description Retrieves or initializes a rendering engine.
   * @summary Gets an existing engine instance or creates and initializes a new one if given a constructor.
   *
   * @template O The type of the rendering engine output
   * @param {Constructor<RenderingEngine<O>> | RenderingEngine<O>} obj - The engine instance or constructor.
   * @returns {RenderingEngine<O>} The initialized rendering engine.
   *
   * @private
   * @static
   */
  private static getOrBoot<O>(
    obj: Constructor<RenderingEngine<O>> | RenderingEngine<O>
  ): RenderingEngine<O> {
    if (obj instanceof RenderingEngine) return obj as RenderingEngine<O>;
    const engine: RenderingEngine<O> = new obj();
    engine.initialize(); // make the booting async. use the initialized flag to control it
    return engine as RenderingEngine<O>;
  }

  /**
   * @description Retrieves a rendering engine by flavor.
   * @summary Gets the current rendering engine or a specific one by flavor.
   *
   * @template O The type of the rendering engine output
   * @param {string} [flavour] - The flavor of the rendering engine to retrieve.
   * @returns {RenderingEngine<O>} The requested rendering engine.
   * @throws {InternalError} If the requested flavor does not exist.
   *
   * @static
   */
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

  /**
   * @description Renders a model using the appropriate rendering engine.
   * @summary Determines the correct rendering engine for a model and invokes its render method.
   *
   * @template M Type extending Model
   * @param {M} model - The model to render.
   * @param {...any[]} args - Additional arguments to pass to the render method.
   * @returns {any} The result of the rendering process.
   * @throws {InternalError} If no registered model is found.
   *
   * @static
   */
  static render<M extends Model>(model: M, ...args: any[]): any {
    const constructor = Model.get(model.constructor.name);
    if (!constructor) throw new InternalError("No model registered found");
    const flavour = Reflect.getMetadata(
      RenderingEngine.key(UIKeys.RENDERED_BY),
      constructor as ModelConstructor<Model>
    );

    // @ts-expect-error for the var args type check
    return RenderingEngine.get(flavour).render(model, ...args);
  }

  /**
   * @description Generates a metadata key for UI-related properties.
   * @summary Prefixes a given key with the UI reflection prefix.
   *
   * @param {string} key - The key to prefix.
   * @returns {string} The prefixed key.
   *
   * @static
   */
  static key(key: string): string {
    return `${UIKeys.REFLECT}${key}`;
  }
}
