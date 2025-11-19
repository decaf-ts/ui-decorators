import { InternalError } from "@decaf-ts/db-decorators";
import {
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
  CrudOperationKeys,
  FieldDefinition,
  FieldProperties,
  UIClassMetadata,
  UIElementMetadata,
  UIListItemElementMetadata,
  UIListPropMetadata,
  UIModelMetadata,
  UIPropMetadata,
} from "./types";
import { RenderingError } from "./errors";
import { formatByType, generateUIModelID } from "./utils";
import { IPagedComponentProperties } from "./interfaces";
import { Constructor, Metadata } from "@decaf-ts/decoration";

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
        case ReservedModels.STRING.name.toLowerCase():
          return HTML5InputTypes.TEXT;
        case ReservedModels.NUMBER.name.toLowerCase():
        case ReservedModels.BIGINT.name.toLowerCase():
          return HTML5InputTypes.NUMBER;
        case ReservedModels.BOOLEAN.name.toLowerCase():
          return HTML5InputTypes.CHECKBOX;
        case ReservedModels.DATE.name.toLowerCase():
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
          return ReservedModels.STRING.name.toLowerCase();
        case HTML5InputTypes.NUMBER:
          return ReservedModels.NUMBER.name.toLowerCase();
        case HTML5InputTypes.CHECKBOX:
          return ReservedModels.BOOLEAN.name.toLowerCase();
        case HTML5InputTypes.DATE:
        case HTML5InputTypes.DATETIME_LOCAL:
        case HTML5InputTypes.TIME:
          return ReservedModels.DATE.name.toLowerCase();
      }
    }
    return key;
  }

  /**
   * @description Retrieves class decorator metadata for a model instance
   * @summary Extracts UI-related class decorators from a model and returns them as an array
   * This method collects metadata from various UI class decorators including @uimodel,
   * @uilistmodel, @uihandlers, and @uilayout applied to the model class.
   *
   * @template M Type extending Model
   * @param {M} model - The model instance to extract metadata from
   * @returns {UIClassMetadata[]} Array of UI class metadata objects
   *
   * @private
   */
  private getClassDecoratorsMetadata<M extends Model>(
    model: M
  ): UIClassMetadata[] {
    return [
      Model.uiModelOf(model.constructor as Constructor<M>),
      Model.uiListModelOf(model.constructor as Constructor<M>),
      Model.uiHandlersFor(model.constructor as Constructor<M>),
      Model.uiLayoutOf(model.constructor as Constructor<M>),
    ].filter(Boolean) as UIClassMetadata[];
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

    const uiDecorators = Model.uiPropertiesOf(
      model.constructor as Constructor<M>
    ) as (keyof M)[];

    // const uiDecorators: Record<string, DecoratorMetadata[]> =
    //   Reflection.getAllPropertyDecorators(model, UIKeys.REFLECT) as Record<
    //     string,
    //     DecoratorMetadata[]
    //   >;
    let children: FieldDefinition<Record<string, any>>[] | undefined;
    let childProps: Record<string, any> = item?.props || {};
    let mapper: Record<string, any> = {};
    const getPath = (parent: string | undefined, prop: string) => {
      return parent ? [parent, prop].join(".") : prop;
    };

    if (uiDecorators) {
      const validationDecorators: Record<string, any> =
        Metadata.get(
          model.constructor as Constructor,
          ValidationKeys.REFLECT
        ) || {};
      // const validationDecorators: Record<
      //   string,
      //   DecoratorMetadata<ValidationMetadata>[]
      // > = Reflection.getAllPropertyDecorators(
      //   model,
      //   ValidationKeys.REFLECT
      // ) as Record<string, DecoratorMetadata<ValidationMetadata>[]>;
      for (const key of uiDecorators) {
        const decs = Model.uiDecorationOf(
          model.constructor as Constructor<M>,
          key
        );
        const type = Model.uiTypeOf(model.constructor as Constructor<M>, key);
        // const types = Object.values(decs).filter(({ key }) =>
        //   [UIKeys.PROP, UIKeys.ELEMENT, UIKeys.CHILD].includes(key)
        // );
        if (!type)
          throw new RenderingError(
            `Only one type of decoration is allowed. Please choose between @uiprop, @uichild or @uielement`
          );
        const hasHideOnDecorator = Model.uiIsHidden(
          model.constructor as Constructor<M>,
          key
        );
        if (hasHideOnDecorator) {
          const hasUiElementDecorator = Model.uiElementOf(
            model.constructor as Constructor<M>,
            key
          );
          if (!hasUiElementDecorator)
            throw new RenderingError(
              `@uielement no found in "${key as string}". It is required to use hiddenOn decorator.`
            );
        }
        const sorted = Object.entries(decs)
          .map(([k, v]) => ({
            key: k,
            props: v,
          }))
          .sort((a) => {
            return [UIKeys.ELEMENT, UIKeys.CHILD].includes(a.key) ? -1 : 1;
          });
        sorted.forEach((dec) => {
          if (!dec) throw new RenderingError(`No decorator found`);

          switch (dec.key) {
            case UIKeys.PROP: {
              childProps[key as any] = dec.props as UIPropMetadata;
              break;
            }
            case UIKeys.CHILD: {
              if (!Model.isPropertyModel(model, key as string))
                throw new RenderingError(
                  `Child "${key as string}" must be a model.`
                );

              let Clazz;
              const submodel = (model as Record<string, any>)[
                key as any
              ] as Model;
              const constructable =
                typeof submodel === "object" &&
                submodel !== null &&
                !Array.isArray(submodel);
              // create instance if undefined
              if (!constructable) {
                const clazzName = (
                  (dec.props as any).props as Record<string, any>
                )?.name as string;
                Clazz = new (Model.get(clazzName) as ModelConstructor<Model>)();
              }

              children = children || [];
              const childrenGlobalProps = Object.assign(
                {},
                globalProps || {},
                { model: Clazz },
                {
                  inheritProps: dec.props as UIModelMetadata,
                  childOf: getPath(
                    globalProps?.childOf as string,
                    key as string
                  ),
                }
              );
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
              if ((dec.props as UIListPropMetadata).name)
                mapper[
                  (dec.props as UIListPropMetadata).name as keyof typeof mapper
                ] = key;
              const props = Object.assign(
                {},
                classDecorator.props?.item || {},
                item?.props || {},
                (dec.props as UIListPropMetadata).props || {},
                globalProps
              );
              childProps = {
                tag: item?.tag || props.render || "",
                props: Object.assign({}, childProps?.props, { mapper }, props),
              };

              break;
            }
            case UIKeys.HIDDEN:
            case UIKeys.PAGE:
            case UIKeys.ORDER:
            case UIKeys.UILAYOUTPROP:
            case UIKeys.ELEMENT: {
              children = children || [];
              const uiProps: UIElementMetadata = dec.props as UIElementMetadata;
              const props = Object.assign(
                {},
                childProps?.props,
                uiProps.props || {},
                uiProps?.props?.name
                  ? {
                      path: getPath(
                        globalProps?.childOf as string,
                        uiProps.props!.name
                      ),
                      childOf: undefined, // The childOf prop is passed by globalProps when it is a nested prop
                    }
                  : {},
                globalProps
              );

              if (dec.key === UIKeys.ELEMENT) {
                const childDefinition: FieldDefinition<Record<string, any>> = {
                  tag: uiProps.tag || childProps?.tag || tag || "",
                  props,
                };
                const validationDecs = validationDecorators[
                  key as any
                ] as ValidationMetadata[];
                const typeDec = validationDecs.shift() as DecoratorMetadata;
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
                }

                if (!childDefinition.props[UIKeys.TYPE]) {
                  const basicType = (typeDec?.props as { name: string }).name;
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
              } else {
                const child = children.find(
                  (c) =>
                    c.props?.name === key ||
                    ([UIKeys.UILAYOUTPROP, UIKeys.PAGE].includes(dec.key) &&
                      c?.props?.childOf === key)
                );
                if (child) {
                  if (dec.key !== UIKeys.UILAYOUTPROP) {
                    child.props = Object.assign({}, child.props, {
                      [dec.key]: uiProps,
                    });
                  } else {
                    const { row, col, props } = dec.props as any;
                    child.props = Object.assign(
                      {},
                      props || {},
                      child.props,
                      row,
                      col
                    );
                  }
                }
              }
              break;
            }
            default:
              throw new RenderingError(`Invalid key: ${dec.key}`);
          }
        });
      }
    }

    globalProps = Object.assign({}, props, globalProps, {
      handlers: handlers || {},
    });

    const operation = globalProps?.operation;
    children = children
      ?.sort((a, b) => (a?.props?.order ?? 0) - (b?.props?.order ?? 0))
      .filter((item) => {
        const hiddenOn = (item?.props?.hidden as CrudOperationKeys[]) || [];
        if (!hiddenOn?.length) return item;
        if (!hiddenOn.includes(operation as CrudOperationKeys)) return item;
      });
    const result: FieldDefinition<T> = {
      tag: tag,
      item: childProps as UIListItemElementMetadata,
      props: globalProps as T & FieldProperties & IPagedComponentProperties,
      children: children as FieldDefinition<any>[],
    };

    if (generateId) result.rendererId = generateUIModelID(model);
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
    const constructor =
      Model.get(model.constructor.name) || Model.fromObject(model);
    if (!constructor) throw new InternalError("No model registered found");
    const flavour = Model.renderedBy(model.constructor as Constructor<M>);

    // @ts-expect-error for the var args type check
    return RenderingEngine.get(flavour).render(model, ...args);
  }
}
