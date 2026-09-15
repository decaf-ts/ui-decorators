import { Validator } from "@decaf-ts/decorator-validation";
import { DecafTranslateService } from "./DecafTranslateService";

export abstract class UIValidator extends Validator {
  static translateService: DecafTranslateService;

  override getMessage(message: string, ...args: any[]): string {
    if (UIValidator.translateService)
      return UIValidator.translateService.translate(message, ...args);
    return super.getMessage(message, ...args);
  }
}
