import { Model } from "@decaf-ts/decorator-validation";
import { RenderingEngine } from "../ui/Rendering";

Model.prototype.render = function <M extends Model>(this: M, ...args: any[]) {
  return RenderingEngine.render(this, ...args);
};
