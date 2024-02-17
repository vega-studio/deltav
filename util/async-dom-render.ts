import * as ReactDOM from "react-dom";
import { GenericFunction } from "./types";
import { NOOP } from "./no-op";

/**
 * This method performs a ReactDOM render, but encapsulates the render with a
 * Promise to make it easier to await the result.
 */
export async function asyncDomRender(
  element: any,
  container: Element | DocumentFragment | null
) {
  let r: GenericFunction<void> = NOOP;
  const p = new Promise((res) => (r = res));
  ReactDOM.render(element, container, r);

  await p;
}
