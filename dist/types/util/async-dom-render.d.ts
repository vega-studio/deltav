/**
 * This method performs a ReactDOM render, but encapsulates the render with a
 * Promise to make it easier to await the result.
 */
export declare function asyncDomRender(element: any, container: Element | DocumentFragment | null): Promise<void>;
