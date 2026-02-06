import { DecafTranslateService } from "./DecafTranslateService";

declare module "@decaf-ts/decorator-validation" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  declare interface BaseValidator {
    translateService: DecafTranslateService;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace BaseValidator {
    let translateService: DecafTranslateService;
  }
}
