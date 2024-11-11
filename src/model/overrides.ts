import { Model } from "@decaf-ts/decorator-validation";
import { UIKeys } from "../ui/constants";
import { RenderingEngine } from "../ui/Rendering";

Model.prototype.render = function <M extends Model>(this: M, ...args: any[]) {
  return RenderingEngine.render(this, ...args);
};

Model.uiKey = function (key: string) {
  return `${UIKeys.REFLECT}${key}`;
};
