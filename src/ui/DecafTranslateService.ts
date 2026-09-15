import { LoggedClass } from "@decaf-ts/logging";

export class DecafTranslateService extends LoggedClass {
  translate(key: string, params?: Record<string, any>): any {
    this.log
      .for(this.translate)
      .info(
        `Must translate ${key} with params ${JSON.stringify(params || {})}`
      );
  }

  instant(key: string, params?: Record<string, any>): any {
    this.log
      .for(this.instant)
      .info(
        `Must translate ${key} with params ${JSON.stringify(params || {})}`
      );
  }
}
