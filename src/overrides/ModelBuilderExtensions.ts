import "@decaf-ts/decorator-validation";
import { ModelBuilder } from "@decaf-ts/decorator-validation";
import {
  uihandlers,
  uilayout,
  uilistmodel,
  uimodel,
  uisteppedmodel,
  renderedBy,
} from "../model/decorators";

declare module "@decaf-ts/decorator-validation" {
  interface ModelBuilder<M> {
    decorateClass(decorator: ClassDecorator): ModelBuilder<M>;
  }
}

declare module "@decaf-ts/decorator-validation" {
  export interface ModelBuilder<M> {
    uimodel(tag?: string, props?: Record<string, any>): ModelBuilder<M>;
    renderedBy(engine: string): ModelBuilder<M>;
    uilistmodel(name?: string, props?: Record<string, any>): ModelBuilder<M>;
    uihandlers(props?: Record<string, any>): ModelBuilder<M>;
    uilayout(
      tag: string,
      colsMode?: number | boolean,
      rows?: number | string[],
      props?: any
    ): ModelBuilder<M>;
    uisteppedmodel(
      tag: string,
      pages?: number | any[],
      paginated?: boolean,
      props?: any
    ): ModelBuilder<M>;
  }
}

const prototype = ModelBuilder.prototype as ModelBuilder<any> & {
  uimodel: (tag?: string, props?: Record<string, any>) => ModelBuilder<any>;
  renderedBy: (engine: string) => ModelBuilder<any>;
  uilistmodel: (name?: string, props?: Record<string, any>) => ModelBuilder<any>;
  uihandlers: (props?: Record<string, any>) => ModelBuilder<any>;
  uilayout: (
    tag: string,
    colsMode?: number | boolean,
    rows?: number | string[],
    props?: any
  ) => ModelBuilder<any>;
  uisteppedmodel: (
    tag: string,
    pages?: number | any[],
    paginated?: boolean,
    props?: any
  ) => ModelBuilder<any>;
};

if (!prototype.decorateClass) {
  prototype.decorateClass = function (decorator: ClassDecorator) {
    if (!(this as any)._classDecorators) {
      (this as any)._classDecorators = [];
    }
    (this as any)._classDecorators.push(decorator);
    return this;
  };
}

prototype.uimodel = function (tag?: string, props?: Record<string, any>) {
  return this.decorateClass(uimodel(tag, props));
};

prototype.renderedBy = function (engine: string) {
  return this.decorateClass(renderedBy(engine));
};

prototype.uilistmodel = function (name?: string, props?: Record<string, any>) {
  return this.decorateClass(uilistmodel(name, props));
};

prototype.uihandlers = function (props?: Record<string, any>) {
  return this.decorateClass(uihandlers(props));
};

prototype.uilayout = function (
  tag: string,
  colsMode?: number | boolean,
  rows?: number | string[],
  props?: any
) {
  return this.decorateClass(uilayout(tag, colsMode, rows, props));
};

prototype.uisteppedmodel = function (
  tag: string,
  pages?: number | any[],
  paginated?: boolean,
  props?: any
) {
  return this.decorateClass(uisteppedmodel(tag, pages, paginated, props));
};
