
/**
 * @namespace ui-decorators.ui.render
 * @memberOf ui-decorators.ui
 */

import {Model} from "@tvenceslau/decorator-validation/lib";

/**
 * Method used to render Models
 *
 * @typedef RenderStrategy
 *
 * @memberOf ui-decorators.ui.render
 */
export type RenderStrategy = <T extends Model>(model: T, mode?: string, ...args: any[]) => any;

/**
 * Mock implementation for a rendering strategy.
 *
 * Each 'medium' would have it's own rendering strategy
 *
 * 'ui-decorators-web' has an HTML5 rendering strategy
 *
 * @param {T} model
 * @param {any[]} args
 *
 * @memberOf ui-decorators.ui.render
 */
function renderStrategy<T extends Model>(model: T, ...args: any[]): any {
    console.log(`Render method called on ${model} with ${args.join(' | ')} without any Rendering Strategy. Doing nothing...`);
}

let activeRenderStrategy: RenderStrategy = renderStrategy;

/**
 * @function getRenderingStrategy
 *
 * @memberOf ui-decorators.ui.render
 */
export function getRenderStrategy(): RenderStrategy{
    return activeRenderStrategy;
}

/**
 * @function setRenderingStrategy
 *
 * @memberOf ui-decorators.ui.render
 */
export function setRenderStrategy(strategy: RenderStrategy): void {
    activeRenderStrategy = strategy;
}