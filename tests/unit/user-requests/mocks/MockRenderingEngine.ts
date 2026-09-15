/**
 * @module ui-decorators/tests/unit/user-requests/mocks/MockRenderingEngine
 * @summary Logging-only rendering-engine mock for the User Request Resolution Engine tests.
 * @description Test-only (lives under `tests/`, never exported from `src`).
 * Extends the real `RenderingEngine` so it registers as the current engine and
 * `RenderingEngine.get()` returns it. The engine-level APIs (`getModal`,
 * `getToast`, `getSpinner`, `router`) do not perform any real rendering work:
 * each one logs the occurrence and details through the decaf logger and returns
 * a compatible logging mock object. Each returned object (`MockModal`,
 * `MockToast`, `MockSpinner`, `MockRouter`) is itself a logging mock whose
 * methods log and return compatible no-ops. The `MockModal` exposed via
 * `getModal` is configurable so the test can drive the user's response
 * (`confirm` submits, `cancel` cancels, `throwsOnConfirm` forces an error) —
 * the "user input mocking" pattern: the mock lets the test control the user's
 * answer without the engine performing real work.
 */

import { Model } from "@decaf-ts/decorator-validation";
import { LoggedClass, Logging } from "@decaf-ts/logging";
import type { UserRequest } from "../../../../src/user-requests";
import { DecafComponent } from "../../../../src/ui/DecafComponent";
import type { IDecafModal } from "../../../../src/ui/interfaces/IDecafModal";
import type { IDecafRouter } from "../../../../src/ui/interfaces/IDecafRouter";
import type { IDecafSpinner } from "../../../../src/ui/interfaces/IDecafSpinner";
import type { IDecafToast } from "../../../../src/ui/interfaces/IDecafToast";
import { RenderingEngine } from "../../../../src/ui/Rendering";
import type {
  DecafSpinnerOptions,
  DecafToastOptions,
  DecafToastRole,
  FieldDefinition,
} from "../../../../src/ui/types";

/**
 * A single recorded facade interaction.
 */
export interface MockUserRequestAction {
  method: string;
  args?: unknown[];
}

/**
 * Tracks a unique rendering-engine flavour so every constructed instance
 * registers with `RenderingEngine` without flavour collisions.
 */
let mockFlavour: number = 0;

/**
 * Logging-only mock rendering engine. Extends the real `RenderingEngine` so
 * `RenderingEngine.get()` returns it and it is assignable to the
 * `RenderingFacade` handed to handlers. Every engine-level call logs the
 * occurrence and details through the decaf logger and returns a compatible
 * logging mock object; no real rendering happens.
 */
export class MockRenderingEngine<T = unknown> extends RenderingEngine {
  /**
   * Recorded facade interactions for assertions. Every interaction (engine
   * call plus child mock method) appends an entry capturing the invoked
   * method and its arguments.
   */
  readonly actions: MockUserRequestAction[] = [];

  private lastModal?: MockModal<T>;

  private readonly modalWaiters: ((modal: MockModal<T>) => void)[] = [];

  constructor() {
    super(`mock-user-requests-${mockFlavour++}`);
  }

  /**
   * The most recent modal returned by `getModal`, so tests can drive the
   * mocked user's response through its configurable `confirm`/`cancel`.
   */
  modal(): MockModal<T> | undefined {
    return this.lastModal;
  }

  /**
   * Resolves to the modal the engine presents for the current request. When a
   * dispatch is already in flight the test awaits this to obtain the modal
   * and drive it. The resolution is deferred until the handler has wired the
   * modal's `confirm`/`cancel` (the next macrotask), so the test can drive
   * the patched methods that resolve the pending request.
   * @return {Promise<MockModal<T>>} A promise resolving to the presented
   * modal mock.
   * @template T The mocked user response type.
   */
  whenModal(): Promise<MockModal<T>> {
    if (this.lastModal) {
      return new Promise<MockModal<T>>((resolve) => {
        setTimeout(() => resolve(this.lastModal as MockModal<T>), 0);
      });
    }
    return new Promise<MockModal<T>>((resolve) => {
      this.modalWaiters.push(resolve);
    });
  }

  /**
   * The recorded facade interactions.
   */
  logActions(): MockUserRequestAction[] {
    return this.actions;
  }

  private track(method: string, ...args: unknown[]): void {
    this.actions.push({ method, args });
    Logging.for(this)
      .for(method)
      .debug(`MockRenderingEngine.${method}`);
  }

  override async initialize(): Promise<void> {
    if (!this.initialized) this.initialized = true;
  }

  override render<M extends Model>(
    model: M,
    globalProps: Record<string, unknown>
  ): FieldDefinition<void> {
    this.track("render", model, globalProps);
    return { tag: "", props: {} } as FieldDefinition<void>;
  }

  override async getToast(options: DecafToastOptions): Promise<IDecafToast> {
    this.track("getToast", options);
    return new MockToast(this, options);
  }

  override async getSpinner(
    options: DecafSpinnerOptions
  ): Promise<IDecafSpinner> {
    this.track("getSpinner", options);
    return new MockSpinner(options);
  }

  override async getModal<C extends DecafComponent<Model>>(
    component: Partial<C>,
    ...args: any[]
  ): Promise<IDecafModal> {
    this.track("getModal", component, ...args);
    const request = (component as { props?: { request?: UserRequest<T> } })
      .props?.request;
    const modal = new MockModal<T>(this, request);
    this.lastModal = modal;
    setTimeout(() => {
      for (const waiter of this.modalWaiters) waiter(modal);
      this.modalWaiters = [];
    }, 0);
    return modal;
  }

  override router(): IDecafRouter {
    this.track("router");
    return new MockRouter(this);
  }
}

/**
 * Configurable logging mock implementing the real event-driven `IDecafModal`.
 * `confirm` logs and (when configured via `throwsOnConfirm`) throws the
 * configured error; `cancel` logs only. The handler wrapped by the engine
 * drives these to deliver submit/cancel/error to the pending request.
 */
export class MockModal<T = unknown>
  extends DecafComponent<Model>
  implements IDecafModal
{
  modal: any;

  title?: string;

  isOpen: boolean = false;

  tag?: string;

  options?: Record<string, unknown>;

  globals?: Record<string, unknown>;

  inlineContent?: string | any;

  inlineContentPosition: "top" | "bottom" = "top";

  fullscreen: boolean = false;

  expandable: boolean = false;

  lightBox: boolean = false;

  headerTransparent: boolean = false;

  headerBackground: string = "light";

  showHeader: boolean = true;

  showCloseButton: boolean = true;

  willDismissEvent: { emit(value: unknown): void };

  expanded: boolean = false;

  iconColor: string = "dark";

  private errorOnConfirm?: Error;

  constructor(
    private readonly engine: MockRenderingEngine<T>,
    readonly request?: UserRequest<T>
  ) {
    super();
    this.willDismissEvent = { emit: (): void => undefined };
  }

  /**
   * Configures the modal so its `confirm` throws the given error — the mocked
   * "erroring" user path.
   * @param {Error} error The decaf error to throw on confirm.
   * @return {MockModal<T>} This modal for chaining.
   * @template T The mocked user response type.
   */
  throwsOnConfirm(error: Error): this {
    this.errorOnConfirm = error;
    return this;
  }

  async ngOnInit(): Promise<void> {
    this.isOpen = true;
    this.log.for(this.ngOnInit).debug("MockModal.ngOnInit");
  }

  override async initialize(...args: unknown[]): Promise<void> {
    await super.initialize(...args);
    this.isOpen = true;
  }

  async prepare(options?: Record<string, unknown>): Promise<void> {
    this.options = { ...(this.options ?? {}), ...(options ?? {}) };
    this.log.for(this.prepare).debug("MockModal.prepare");
  }

  parseInlineContent(): void {
    this.log.for(this.parseInlineContent).debug("MockModal.parseInlineContent");
  }

  async create(props?: Record<string, unknown>): Promise<any> {
    await this.prepare(props);
    await this.present();
    return this;
  }

  async present(): Promise<void> {
    this.isOpen = true;
    this.engine.actions.push({ method: "modal.present" });
    this.log.for(this.present).debug("MockModal.present");
  }

  async handleEvent(event: any): Promise<void> {
    this.engine.actions.push({ method: "modal.handleEvent", args: [event] });
    this.log.for(this.handleEvent).debug("MockModal.handleEvent");
    await (event?.data ? this.confirm(event) : this.cancel());
  }

  async handleWillDismiss(event: any): Promise<{ data?: unknown }> {
    this.isOpen = false;
    const data = (event?.detail ?? event)?.data;
    this.willDismissEvent.emit(data ?? event);
    return { data };
  }

  handleExpandToggle(): void {
    this.expanded = !this.expanded;
    this.log
      .for(this.handleExpandToggle)
      .debug("MockModal.handleExpandToggle");
  }

  /**
   * Submits the modal: logs the submission and, when configured via
   * `throwsOnConfirm`, throws the configured error (which the handler turns
   * into a rejected request).
   */
  async confirm(event?: any): Promise<void> {
    this.engine.actions.push({ method: "modal.confirm", args: [event] });
    this.log.for(this.confirm).debug("MockModal.confirm");
    if (this.errorOnConfirm) throw this.errorOnConfirm;
    this.isOpen = false;
    this.willDismissEvent.emit(event?.data ?? event);
  }

  /**
   * Cancels the modal: logs the cancellation and dismisses without data.
   */
  async cancel(): Promise<void> {
    this.engine.actions.push({ method: "modal.cancel" });
    this.log.for(this.cancel).debug("MockModal.cancel");
    this.isOpen = false;
    this.willDismissEvent.emit(this.request);
  }
}

/**
 * Logging-only toast mock implementing `IDecafToast`: every presentation
 * method logs through the decaf logger and returns a compatible no-op.
 */
export class MockToast extends LoggedClass implements IDecafToast {
  readonly options: DecafToastOptions;

  constructor(
    private readonly engine: MockRenderingEngine<unknown>,
    options: DecafToastOptions
  ) {
    super();
    this.options = options;
  }

  private async record(message: string, role?: string): Promise<void> {
    this.engine.actions.push({ method: "toast.show", args: [message, role] });
    this.log.for(this.record).debug(`MockToast.${role ?? "show"}: ${message}`);
  }

  async error(message: string): Promise<DecafToastRole> {
    await this.record(message, "error");
    return "cancel";
  }

  async create(options: DecafToastOptions): Promise<object> {
    await this.record(options.message, options.color);
    return {};
  }

  async show(message: string, options?: DecafToastOptions): Promise<void> {
    await this.record(message, options?.color);
  }

  async success(message: string): Promise<void> {
    await this.record(message, "success");
  }

  async warn(message: string): Promise<DecafToastRole> {
    await this.record(message, "warning");
    return "cancel";
  }
}

/**
 * Logging-only spinner mock implementing `IDecafSpinner` with observable decaf
 * logging and trivial no-op state.
 */
export class MockSpinner extends LoggedClass implements IDecafSpinner {
  private visible: boolean = false;

  private message: string = "";

  isVisible(): boolean {
    return this.visible;
  }

  async show(
    message: string | Record<string, any>,
    options?: Record<string, any>
  ): Promise<void> {
    this.message =
      typeof message === "string" ? message : (message.message as string) ?? "";
    this.visible = true;
    this.log.for(this.show).debug(`MockSpinner.show: ${this.message}`);
    void options;
  }

  async update(
    message: string,
    isProgressUpdate?: boolean | number
  ): Promise<void> {
    this.message = message;
    this.log
      .for(this.update)
      .debug(`MockSpinner.update: ${message} (${isProgressUpdate ?? false})`);
  }

  async remove(): Promise<void> {
    this.visible = false;
    this.log.for(this.remove).debug("MockSpinner.remove");
  }

  async getOptions(
    options?: Record<string, any>,
    message?: string
  ): Promise<Record<string, any>> {
    const result = { ...(options ?? {}), message: message ?? this.message };
    return result;
  }

  async getMessage(): Promise<string> {
    return this.message;
  }
}

/**
 * Logging-only router mock implementing `IDecafRouter` with deterministic
 * no-op navigation data recorded through decaf loggers.
 */
export class MockRouter extends LoggedClass implements IDecafRouter {
  readonly navigations: {
    page: string;
    direction?: "forward" | "back" | "root";
    options?: Record<string, unknown>;
  }[] = [];

  constructor(private readonly engine: MockRenderingEngine<unknown>) {
    super();
  }

  parseAllQueryParams(params?: string | string[]): Record<string, any>[] {
    this.engine.actions.push({
      method: "router.parseAllQueryParams",
      args: [params],
    });
    return [];
  }

  hasQueryParam(param: string): boolean {
    this.engine.actions.push({ method: "router.hasQueryParam", args: [param] });
    return false;
  }

  getQueryParam(param: string): Record<string, any> | undefined {
    this.engine.actions.push({ method: "router.getQueryParam", args: [param] });
    return undefined;
  }

  getQueryParamValue(param: string): string | undefined {
    this.engine.actions.push({
      method: "router.getQueryParamValue",
      args: [param],
    });
    return undefined;
  }

  getLastUrlSegment(): string {
    return "mock";
  }

  getCurrentUrl(): string {
    return "mock";
  }

  getPreviousUrl(): string {
    return "previous";
  }

  backToLastPage(): void {
    this.engine.actions.push({ method: "router.backToLastPage" });
  }

  async navigate(
    page: string,
    direction?: "forward" | "back" | "root",
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.navigations.push({ page, direction, options });
    this.engine.actions.push({
      method: "router.navigate",
      args: [page, direction, options],
    });
    this.log.for(this.navigate).debug(`MockRouter.navigate: ${page}`);
    return true;
  }
}
