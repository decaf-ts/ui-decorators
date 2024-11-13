export interface Renderable {
  render<R>(...args: any[]): R;
}
