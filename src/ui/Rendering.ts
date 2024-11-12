import { InternalError } from "@decaf-ts/db-decorators";
import {
  Constructor,
  Model,
  ModelConstructor,
} from "@decaf-ts/decorator-validation";
import { UIKeys } from "./constants";

export abstract class RenderingEngine {
  private static cache: Record<
    string,
    Constructor<RenderingEngine> | RenderingEngine
  >;
  private static current: Constructor<RenderingEngine> | RenderingEngine;

  protected initialized: boolean = false;

  protected constructor(readonly flavour: string) {
    RenderingEngine.register(this);
  }

  abstract initialize(...args: any[]): Promise<void>;
  abstract render(...args: any[]): any;

  static register(engine: RenderingEngine) {
    this.cache = this.cache || {};
    if (engine.flavour in this.cache)
      throw new InternalError(
        `Rendering engine under ${engine.flavour} already exists`
      );
    this.cache[engine.flavour] = engine;
    this.current = engine;
  }

  private static getOrBoot(
    obj: Constructor<RenderingEngine> | RenderingEngine
  ): RenderingEngine {
    if (obj instanceof RenderingEngine) return obj;
    const engine: RenderingEngine = new obj();
    engine.initialize(); // make the booting async. use the initialized flag to control it
    return engine;
  }

  static get(flavour?: string): RenderingEngine {
    if (!flavour) return this.getOrBoot(this.current);
    if (!(flavour in this.cache))
      throw new InternalError(
        `Rendering engine under ${flavour} does not exist`
      );
    return this.getOrBoot(this.cache[flavour]);
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
}
