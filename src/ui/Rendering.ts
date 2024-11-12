import { InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
} from "@decaf-ts/decorator-validation";
import { UIKeys } from "./constants";
import { FieldDefinition } from "./types";

export abstract class RenderingEngine<O = FieldDefinition> {
  private static cache: Record<
    string,
    Constructor<RenderingEngine<unknown>> | RenderingEngine<unknown>
  >;
  private static current:
    | Constructor<RenderingEngine<unknown>>
    | RenderingEngine<unknown>;

  protected initialized: boolean = false;

  protected constructor(readonly flavour: string) {
    RenderingEngine.register(this);
  }

  abstract initialize(...args: any[]): Promise<void>;

  render<M extends Model>(model: M, ...args: any[]): O {
    throw new Error();
  }

  static register(engine: RenderingEngine<unknown>) {
    this.cache = this.cache || {};
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
      `${UIKeys.REFLECT}${UIKeys.UIMODEL}`,
      constructor as ModelConstructor<Model>
    );
    return this.get(flavour).render(model, ...args);
  }
  //
  // static key(key: string) {
  //   return `${UIKeys.REFLECT}${key}`;
  // }
}
