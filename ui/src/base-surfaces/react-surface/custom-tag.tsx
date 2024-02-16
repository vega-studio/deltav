import React from "react";
import { SurfaceContext } from "./surface-jsx";
import { isString } from "../../types";

interface IProps extends Record<string, any> {
  /** Supports children */
  children?: React.ReactNode;
  /** Supports the tag name */
  tagName?: string;
}

function useStringifiedAttributes<T extends IProps>(props: T) {
  // Extract `children` and `tagName` from props as they are not to be
  // stringified
  const { children, tagName, ...restProps } = props;

  // Prepare the attributes by stringifying the prop values
  const attributes = (
    Object.keys(restProps) as (keyof typeof restProps)[]
  ).reduce(
    (acc, key) => {
      // Stringify the value; ensure to catch and handle any potential errors
      // during stringification
      try {
        if (isString(key)) {
          acc[key.toLowerCase() as Exclude<keyof T, "tagName" | "children">] =
            JSON.stringify(restProps[key]);
        }
      } catch (error) {
        // console.error(`Error stringifying prop ${key as string}:`, error);
        // NOOP errors and just exclude them from the DOM.
      }
      return acc;
    },
    {} as Record<keyof typeof restProps, string>
  );

  return { tagName, attributes, children };
}

/**
 * Generates a dom element with a custom tag name. This also renders the props
 * handed to it as attributes on the element. Mostly used for debugging react
 * elements that don't have direct DOM influence but are wrapping browser
 * resources.
 */
export const CustomTag = <T extends IProps>(props: T) => {
  // Use the custom hook to get processed props and attributes
  const {
    tagName = "",
    attributes,
    children,
  } = useStringifiedAttributes(props);

  const { writeToDom } = React.useContext(SurfaceContext) || {};
  if (!writeToDom) return props.children;

  // Create the element with React.createElement, passing the stringified attributes
  const element = React.createElement(tagName, attributes, children);

  return element;
};
