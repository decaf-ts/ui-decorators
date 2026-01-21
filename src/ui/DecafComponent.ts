import { LoggedClass } from "@decaf-ts/logging";
import { UIFunctionLike } from "./types";
import { Model } from "@decaf-ts/decorator-validation";
import { IRepository, OperationKeys } from "@decaf-ts/db-decorators";

type PrimaryKeyType = string | number | bigint;

/**
 * Base class for all Decaf UI components, providing common state management,
 * logging, localization, navigation hooks, CRUD context metadata, and
 * repository integration used by higher-level decorators and renderers.
 */
export abstract class DecafComponent<M extends Model> extends LoggedClass {
  /**
   * @description Data model or model name for component operations.
   * @summary The data model that this component will use for CRUD operations. This can be provided
   * as a Model instance, a model constructor, or a string representing the model's registered name.
   * When set, this property provides the component with access to the model's schema, validation rules,
   * and metadata needed for rendering and data operations.
   * @type {M | Model | string | undefined}
   */
  model!: M | Model | string | undefined;

  /**
   * @description Primary key value of the current model instance.
   * @summary Specifies the primary key value for the current model record being displayed or
   * manipulated by the component. This identifier is used for CRUD operations that target
   * specific records, such as read, update, and delete operations. The value corresponds to
   * the field designated as the primary key in the model definition.
   * @type {PrimaryKeyType | PrimaryKeyType[]}
   */
  modelId?: PrimaryKeyType | PrimaryKeyType[];

  /**
   * @description The CRUD operation type to be performed on the model.
   * @summary Specifies which operation (Create, Read, Update, Delete) this component instance
   * should perform. This determines the UI behavior, form configuration, and available actions.
   * The operation affects form validation, field availability, and the specific repository
   * method called during data submission.
   *
   * @type {OperationKeys}
   */
  operation?: OperationKeys;

  /**
   * @description Router instance for programmatic navigation.
   * @summary Injected Router service used for programmatic navigation between routes
   * in the application. This service enables navigation to different views and operations,
   * handles route parameters, and manages the browser's navigation history.
   * @protected
   * @type {Router}
   */
  router?: any;

  /**
   * @description Name identifier for the component instance.
   * @summary Provides a string identifier that can be used to name or label the component
   * instance. This name can be used for debugging purposes, logging, or to identify specific
   * component instances within a larger application structure. It serves as a human-readable
   * identifier that helps distinguish between multiple instances of the same component type.
   * @type {string}
   */
  name!: string;

  /**
   * @description Parent component identifier for hierarchical component relationships.
   * @summary Specifies the identifier of the parent component in a hierarchical component structure.
   * This property establishes a parent-child relationship between components, allowing for
   * proper nesting and organization of components within a layout. It can be used to track
   * component dependencies and establish component hierarchies for rendering and event propagation.
   * @type {string | undefined}
   */
  childOf!: string | undefined;

  /**
   * @description Unique identifier for the component instance.
   * @summary A unique identifier automatically generated for each component instance.
   * This UID is used for DOM element identification, component tracking, and debugging purposes.
   * By default, it generates a random 16-character value, but it can be explicitly set via input.
   * @type {string}
   */
  uid?: PrimaryKeyType;

  /**
   * @description Primary key field name for the data model.
   * @summary Specifies which field in the model should be used as the primary key.
   * This is typically used for identifying unique records in operations like update and delete.
   * If not explicitly set, it defaults to the repository's configured primary key or 'id'.
   * @type {keyof M | string}
   * @default 'id'
   */
  pk!: keyof M | string;

  /**
   * @description Flag to enable or disable dark mode support for the component.
   * @summary When enabled, the component will automatically detect the system's dark mode
   * preference using the media service and apply appropriate styling classes. This flag
   * controls whether the component should respond to dark mode changes and apply the
   * dark palette class to its DOM element. By default, dark mode support is disabled.
   * @protected
   * @type {boolean}
   * @default false
   */
  protected enableDarkMode: boolean = true;

  /**
   * @description Flag to enable or disable dark mode support for the component.
   * @summary When enabled, the component will automatically detect the system's dark mode
   * preference using the media service and apply appropriate styling classes. This flag
   * controls whether the component should respond to dark mode changes and apply the
   * dark palette class to its DOM element. By default, dark mode support is disabled.
   * @protected
   * @type {boolean}
   * @default false
   */
  protected isDarkMode: boolean = false;

  /**
   * @description Current locale identifier for component internationalization.
   * @summary Specifies the locale code (e.g., 'en-US', 'pt-BR') used for translating UI text
   * and formatting data according to regional conventions. This property can be set to override
   * the default application locale for this specific component instance, enabling per-component
   * localization when needed.
   * @type {string | undefined}
   */
  locale?: string;

  /**
   * @description Configuration for list item rendering behavior.
   * @summary Defines how list items should be rendered in the component.
   * This property holds a configuration object that specifies the tag name
   * and other properties needed to render list items correctly. The tag property
   * identifies which component should be used to render each item in a list.
   * Additional properties can be included to customize the rendering behavior.
   * @type {Record<string, unknown>}
   * @default {tag: ""}
   */
  item: Record<string, unknown> = { tag: "" };

  /**
   * @description Dynamic properties configuration for runtime customization.
   * @summary Contains key-value pairs of dynamic properties that can be applied to the component
   * at runtime. This flexible configuration object allows for dynamic property assignment without
   * requiring explicit input bindings for every possible configuration option. Properties from
   * this object are parsed and applied to the component instance through the parseProps method,
   * enabling customizable component behavior based on external configuration.
   * @type {Record<string, unknown>}
   * @default {}
   */
  props: Record<string, unknown> = {};

  /**
   * @description Base route path for component navigation.
   * @summary Defines the base route path used for navigation actions related to this component.
   * This is often used as a prefix for constructing navigation URLs when transitioning between
   * different operations or views. The route helps establish the component's position in the
   * application's routing hierarchy.
   * @type {string}
   */
  route?: string = "";

  /**
   * @description Controls whether borders are displayed around the component.
   * @summary Boolean flag that determines if the component should be visually outlined with borders.
   * When true, borders are shown to visually separate the component from surrounding content.
   *
   * @type {boolean}
   * @default false
   */
  borders: boolean = false;

  /**
   * @description Component name identifier for logging and localization contexts.
   * @summary Stores the component's name which is used as a key for logging contexts
   * and as a base for locale resolution.
   * @protected
   * @type {string | undefined}
   */
  protected componentName?: string;

  /**
   * @description Root key for component locale context resolution.
   * @summary Defines the base key used to resolve localization contexts for this component.
   * If not explicitly provided, it defaults to the component's name. This key is used to
   * load appropriate translation resources and locale-specific configurations.
   * @protected
   * @type {string | undefined}
   */
  protected localeRoot?: string;

  /**
   * @description Current value of the component.
   * @summary Can be a string, number, date, or array of string or objects.
   * @type {any}
   * @public
   */
  value?: any;

  /**
   * @description Reference to CRUD operation constants for template usage.
   * @summary Exposes the OperationKeys enum to the component template, enabling
   * conditional rendering and behavior based on operation types. This protected
   * readonly property ensures that template logic can access operation constants
   * while maintaining encapsulation and preventing accidental modification.
   * @protected
   * @readonly
   */
  protected readonly OperationKeys = OperationKeys;

  /**
   * @description Angular Location service.
   * @summary Injected service that provides direct access to the browser's URL and history.
   * Unlike the Router, Location allows for low-level manipulation of the browser's history stack
   * and URL path, such as programmatically navigating back or forward, or updating the URL without
   * triggering a route change. This is useful for scenarios where you need to interact with the
   * browser history or URL outside of Angular's routing system, such as closing modals, handling
   * popstate events, or supporting custom navigation logic.
   *
   */
  location!: any;

  /**
   * @description Repository instance for data layer operations.
   * @summary Provides a connection to the data layer for retrieving and manipulating data.
   * This is an instance of the DecafRepository class, initialized lazily in the repository getter.
   * The repository is used to perform CRUD (Create, Read, Update, Delete) operations on the
   * data model and provides methods for querying and filtering data based on specific criteria.
   * @type {IRepository<M>}
   * @protected
   */
  protected _repository?: IRepository<M>;

  /**
   * @description Initialization status flag for the component.
   * @summary Tracks whether the component has completed its initialization process.
   * This flag is used to prevent duplicate initialization and to determine if
   * certain operations that require initialization can be performed.
   * @type {boolean}
   * @default false
   */
  protected initialized: boolean = false;

  protected events?: Record<
    keyof Pick<DecafComponent<M>, "render" | "initialize">,
    UIFunctionLike
  >;

  protected handlers: Record<string, UIFunctionLike> = {};

  constructor() {
    super();
  }

  get repository(): IRepository<M> {
    return this._repository as IRepository<M>;
  }

  set repository(repository: IRepository<M>) {
    this._repository = repository;
  }

  async render(...args: unknown[]): Promise<void> {
    this.log
      .for(this.render)
      .info(`render for ${this.componentName} with ${JSON.stringify(args)}`);
  }

  async refresh(...args: unknown[]): Promise<void> {
    this.log.for(this.refresh).info(`Refresh called with args: ${args}`);
  }

  /**
   * Asynchronously initializes the component with the provided arguments.
   * This method sets the `initialized` property to `true` once the initialization is complete.
   *
   * @param args - A variable number of arguments of unknown types that can be used for initialization.
   * @returns A promise that resolves when the initialization is complete.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initialize(...args: unknown[]): Promise<void> {
    this.initialized = true;
  }

  /**
   * Translates content based on the provided arguments.
   * Logs the translation request with the component name and arguments.
   *
   * @param args - A variable number of arguments used for translation.
   * @returns A promise that resolves with the translation result.
   */
  protected async translate(...args: unknown[]): Promise<any> {
    this.log
      .for(this.translate)
      .info(`translate for ${this.componentName} with ${JSON.stringify(args)}`);
  }

  async preview(...args: unknown[]): Promise<void> {
    this.log.for(this.preview).debug(`Preview called with args: ${args}`);
  }

  // async process(...args: unknown[]): Promise<any> {
  //   this.log.for(this.process).debug(`Process called with args: ${args}`);
  // }

  // async batchOperation(...args: unknown[]): Promise<any> {
  //   this.log
  //     .for(this.batchOperation)
  //     .debug(`BatchOperation called with args: ${args}`);
  // }

  /**
   * Submits data or performs an action associated with the component.
   *
   * @param args - A variable number of arguments of any type to be passed to the submit operation.
   * @returns A promise that resolves with the result of the submit operation.
   */
  async submit(...args: unknown[]): Promise<any> {
    this.log
      .for(this.submit)
      .info(`submit for ${this.componentName} with ${JSON.stringify(args)}`);
  }
}
