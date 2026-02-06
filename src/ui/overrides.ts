import { Validator } from "@decaf-ts/decorator-validation";
import "./validator";

(Validator as any).getMessage = function (message: string, ...args: any[]) {
  if ((Validator as any).translateService)
    return (Validator as any).translateService.translate(message, ...args);
  return this.getMessage(message, ...args);
};
