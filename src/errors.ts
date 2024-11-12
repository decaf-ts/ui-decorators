import { BaseError } from "@decaf-ts/db-decorators";

export class RenderingError extends BaseError {
  constructor(msg: string | Error) {
    super(RenderingError.name, msg);
  }
}
