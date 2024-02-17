import React from "react";
interface IProps extends Record<string, any> {
    /** Supports children */
    children?: React.ReactNode;
    /** Supports the tag name */
    tagName?: string;
}
/**
 * Generates a dom element with a custom tag name. This also renders the props
 * handed to it as attributes on the element. Mostly used for debugging react
 * elements that don't have direct DOM influence but are wrapping browser
 * resources.
 */
export declare const CustomTag: <T extends IProps>(props: T) => React.ReactNode;
export {};
