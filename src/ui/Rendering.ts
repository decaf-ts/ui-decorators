import { InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
  ReservedModels,
  ValidationKeys,
  ValidationMetadata,
} from "@decaf-ts/decorator-validation";
import {
  HTML5DateFormat,
  HTML5InputTypes,
  UIKeys,
  ValidatableByAttribute,
  ValidatableByType,
} from "./constants";
import {
  FieldDefinition,
  FieldProperties,
  UIClassMetadata,
  UIElementMetadata,
  UILayoutItemMetadata,
  UIListItemElementMetadata,
  UIModelMetadata,
  UIPropMetadata,
} from "./types";
import { RenderingError } from "./errors";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
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
        case HTML5InputTypes.SELECT:
        case HTML5InputTypes.TEXT:
        case HTML5InputTypes.EMAIL:
        case HTML5InputTypes.COLOR:
        case HTML5InputTypes.PASSWORD:
        case HTML5InputTypes.TEL:
        case HTML5InputTypes.URL:
        case HTML5InputTypes.SEARCH:
        case HTML5InputTypes.HIDDEN:
        case HTML5InputTypes.TEXTAREA:
        case HTML5InputTypes.RADIO:
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
   * @description Retrieves class decorator metadata for a model instance
   * @summary Extracts UI-related class decorators from a model and returns them as an array
   * This method collects metadata from various UI class decorators including @uimodel,
   * @uilistitem, @uihandlers, and @uilayout applied to the model class.
   *
   * @template M Type extending Model
   * @param {M} model - The model instance to extract metadata from
   * @returns {UIClassMetadata[]} Array of UI class metadata objects
   *
   * @private
   */
  private getClassDecoratorsMetadata<M extends Model>(model: M): UIClassMetadata[]  {
    return [
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UIMODEL),
        model.constructor
      ) ||
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UIMODEL),
        Model.get(model.constructor.name) as any
      ),
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UILISTITEM),
        model.constructor
      ) ||
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UILISTITEM),
        Model.get(model.constructor.name) as any
      ),
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.HANDLERS),
        model.constructor
      ) ||
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.HANDLERS),
        Model.get(model.constructor.name) as any
      ),
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UILAYOUT),
        model.constructor
      ) ||
      Reflect.getMetadata(
        RenderingEngine.key(UIKeys.UILAYOUT),
        Model.get(model.constructor.name) as any
      ),
    ].filter(Boolean);;
  }

  /**
   * @description Checks if a type is validatable by its nature.
   * @summary Determines if a given UI key represents a type that is inherently validatable.
   *
   * @param {string} key - The UI key to check.
   * @returns {boolean} True if the type is validatable, false otherwise.
   */
  protected isValidatableByType(key: string): boolean {
    return Object.keys(ValidatableByType).includes(key);
  }

  /**
   * @description Checks if a type is validatable by attribute.
   * @summary Determines if a given UI key represents a validation that can be applied as an attribute.
   *
   * @param {string} key - The UI key to check.
   * @returns {boolean} True if the type is validatable by attribute, false otherwise.
   */
  protected isValidatableByAttribute(key: string): boolean {
    return Object.keys(ValidatableByAttribute).includes(key);
  }

  /**
   * @description Converts validation metadata to an attribute value.
   * @summary Transforms validation metadata into a value suitable for use as an HTML attribute.
   *
   * @param {string} key - The validation key.
   * @param {ValidationMetadata} value - The validation metadata.
   * @returns {string | number | boolean} The converted attribute value.
   * @throws {Error} If the given key is not validatable by attribute.
   */
  protected toAttributeValue(
    key: string,
    value: ValidationMetadata
  ): string | number | boolean {
    if (!Object.keys(ValidatableByAttribute).includes(key))
      throw new Error(
        `Invalid attribute key "${key}". Expected one of: ${Object.keys(ValidatableByAttribute).join(", ")}.`
      );

    return key === UIKeys.REQUIRED ? true : value[key];
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
    
    const { inheritProps, ...globalPropsWithoutInherits } = globalProps;
    globalProps = globalPropsWithoutInherits;

    const classDecorators = this.getClassDecoratorsMetadata<M>(model);

    if (!classDecorators.length)
      throw new RenderingError(
        `No ui definitions set for model ${model.constructor.name}. Did you use @uimodel?`
      );

    const classDecorator = Object.assign(
      {},
      ...classDecorators,
      inheritProps ? inheritProps : {} // override tag and properties when it is a component that should inherit properties from its parent.
    );
    const { tag, props, item, handlers } = classDecorator;

    const uiDecorators: Record<string, DecoratorMetadata[]> =
      Reflection.getAllPropertyDecorators(model, UIKeys.REFLECT) as Record<
        string,
        DecoratorMetadata[]
      >;
    let children: FieldDefinition<Record<string, any>>[] | undefined;
    let childProps: Record<string, any> = item?.props || {};
    let mapper: Record<string, string> = {};
    const getPath = (parent: string | undefined, prop: string) => {
      return parent ? [parent, prop].join(".") : prop;
    };

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
        const types = Object.values(decs).filter(({key}) => [UIKeys.PROP, UIKeys.ELEMENT, UIKeys.CHILD].includes(key));
        if (types?.length > 1)
          throw new RenderingError(
            `Only one type of decoration is allowed. Please choose between @uiprop, @uichild or @uielement`
          );
        decs.shift();
        const sorted = decs.sort((a, b) => {
          return a.key === UIKeys.ELEMENT ? -1 : 1;
        });
        sorted.forEach((dec) => {
          if (!dec) throw new RenderingError(`No decorator found`);

          switch (dec.key) {
            case UIKeys.PROP: {
              childProps[key] = dec.props as UIPropMetadata;
              break;
            }
            case UIKeys.CHILD: {
              if (!Model.isPropertyModel(model, key))
                throw new RenderingError(`Child "${key}" must be a model.`);

              let Clazz;
              const submodel = (model as Record<string, any>)[key] as Model;
              const constructable =
                typeof submodel === "object" &&
                submodel !== null &&
                !Array.isArray(submodel);
              // create instance if undefined
              if (!constructable) {
                const clazzName = (dec.props.props as Record<string, any>)
                  ?.name as string;
                Clazz = new (Model.get(clazzName) as ModelConstructor<Model>)();
              }

              children = children || [];
              const childrenGlobalProps = Object.assign({}, globalProps || {}, {"model": Clazz} ,{
                inheritProps: dec.props as UIModelMetadata,
                childOf: getPath(globalProps?.childOf as string, key),
              });
              const childDefinition = this.toFieldDefinition(
                submodel || Clazz, // Must avoid undefined values — an instance is required to retrieve properties.
                childrenGlobalProps,
                false
              );
              children.push(
                childDefinition as FieldDefinition<Record<string, any>>
              );
              break;
            }
            case UIKeys.UILISTPROP: {
              mapper = mapper || {};
              if(dec.props?.name)
                mapper[dec.props?.name as string] = key;
              const props = Object.assign(
                {},
                classDecorator.props?.item || {},
                item?.props || {},
                dec.props?.props || {},
                globalProps
              );
              childProps = {
                tag: item?.tag || props.render || "",
                props: Object.assign(
                  {}, 
                  childProps?.props, 
                  { mapper }, 
                  props),
              };

              break;
            }
            case UIKeys.HIDDEN: 
            case UIKeys.ELEMENT: {
              children = children || [];
              const uiProps: UIElementMetadata = dec.props as UIElementMetadata;
              const props = Object.assign(
                  {},
                  childProps?.props,
                  uiProps.props || {},
                  (uiProps?.props?.name ? {
                    path: getPath(
                      globalProps?.childOf as string,
                      uiProps.props!.name
                    ),
                    childOf: undefined, // The childOf prop is passed by globalProps when it is a nested prop
                  } : {}),
                  globalProps
                );
                const tag = uiProps.tag || childProps?.tag;
                const childDefinition: FieldDefinition<Record<string, any>> = {
                  tag,
                  props,
                };
              if(dec.key === UIKeys.ELEMENT) {
                const validationDecs = validationDecorators[key] as DecoratorMetadata<ValidationMetadata>[];
                const typeDec = validationDecs.shift() as DecoratorMetadata;
                for (const dec of validationDecs) {
                  if (this.isValidatableByAttribute(dec.key)) {
                    childDefinition.props[this.translate(dec.key)] = this.toAttributeValue(dec.key, dec.props);
                    continue;
                  }
                  if (this.isValidatableByType(dec.key)) {
                    if (dec.key === HTML5InputTypes.DATE) {
                      childDefinition.props[UIKeys.FORMAT] = dec.props.format || HTML5DateFormat;
                    }
                    childDefinition.props[UIKeys.TYPE] = dec.key;
                    continue;
                  }
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
              }
              if(dec.key === UIKeys.HIDDEN) {
                const child = children.find(c => c.props?.name === key);
                if (child) {
                  child.props = Object.assign({}, child.props, { [dec.key]: uiProps });
                } else {
                  children.push(childDefinition);
                }
              }
              break;
            }
            case UIKeys.UILAYOUTITEM: 
            break;
            default:
              throw new RenderingError(`Invalid key: ${dec.key}`);
          }
        });
      }
    }

    globalProps = Object.assign({}, props, globalProps, {
      handlers: handlers || {},
    });
    const result: FieldDefinition<T> = {
      tag: tag,
      item: childProps as UIListItemElementMetadata,
      props: globalProps as T & FieldProperties,
      children: ((Object.keys(uiDecorators)?.length && children?.length) ? 
        this.getLayoutItems(children, uiDecorators) : children),
    
    };

    if (generateId) result.rendererId = generateUIModelID(model);
    return result;
  }

  /**
   * @description Processes layout items for grid positioning
   * @summary Maps child field definitions to their corresponding layout positions
   * This method iterates through child field definitions and applies layout metadata
   * from @uilayoutitem decorators to position them correctly in a grid layout.
   *
   * @param {FieldDefinition[]} children - Array of child field definitions to process
   * @param {Record<string, any>} uiDecorators - UI decorator metadata keyed by property name
   * @returns {FieldDefinition[]} Array of field definitions with layout positioning applied
   *
   * @example
   * // Internal usage - positions children in grid layout
   * const layoutChildren = this.getLayoutItems(childDefinitions, decoratorMetadata);
   */
  getLayoutItems(children: FieldDefinition<any>[], uiDecorators: Record<string, any>): FieldDefinition<any>[] {
    return children.map((child) => {
      let updatedChild = child;
      for (const key in uiDecorators) {
        const decs = uiDecorators[key];
        for (const dec of decs) {
          if (
            dec.key === UIKeys.UILAYOUTITEM &&
            (dec.props?.name === child.props?.name || dec.props?.name === child.props?.childOf)
          ) {
            const { col, props, row } = dec.props as UILayoutItemMetadata;
            updatedChild = {
              row,
              col,
              ...child,
              props: {
                ...child.props,
                ...props,
              },
            };
            break;
          }
        }
      }
      return updatedChild;
    });
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
    const constructor =
      Model.get(model.constructor.name) || Model.fromObject(model);
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
