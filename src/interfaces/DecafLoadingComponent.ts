import { LoggedClass } from '@decaf-ts/logging';
import { IDecafLoadingOptions } from "./IDecafLoadingOptions";

/**
 * @class DecafLoadingComponent
 * @summary Skeleton implementation that logs each API call for tracing.
 */
export class DecafLoadingComponent extends LoggedClass {

  isVisible(): boolean {
    this.log.for(this).info("Checks whether a loading overlay is currently visible.");
    return false;
  }

  async show(message: string, options?: IDecafLoadingOptions): Promise<void> {
    this.log.for(this).info(`Displays the loading overlay with the provided message and options. ${message}, ${JSON.stringify(options)}`);
  }

  async update(message: string, isProgressUpdate: boolean | number = false): Promise<void> {
    this.log.for(this).info(`Updates the overlay message and optionally reports progress. ${message}, ${isProgressUpdate}`);
  }

  async remove(): Promise<void> {
    this.log.for(this).info("Dismisses the active loading overlay and clears state.");
  }

  async getOptions(options: IDecafLoadingOptions = {}, message?: string): Promise<IDecafLoadingOptions> {
    this.log.for(this).info(`Combines default loading options with caller overrides. ${message}, ${JSON.stringify(options)}`);
    return { ...options, message };
  }

  async getMessage(): Promise<string> {
    this.log.for(this).info("Returns the message currently shown in the loading overlay. ${message}, ${JSON.stringify(options)}");
    return "";
  }
}