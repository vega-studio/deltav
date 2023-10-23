import { cva as cvaPackage } from "class-variance-authority";

/**
 * A small wrapper around class-variance-authority's cva function that
 * also exports the variant props.
 *
 * Normal cva usage would look like this:
 * <Button mode="primary" />
 *
 * The wrapper allows you to do this instead:
 * <Button mode={ButtonCva.mode.primary} />
 */
export const cva = <T>(...args: Parameters<typeof cvaPackage<T>>) => {
  const result = cvaPackage(...args);

  const variantOptions = args[1]?.variants;
  const defaults = args[1]?.defaultVariants;
  const enums = getEnums(variantOptions);

  return {
    variants: result,
    defaults,
    ...(enums as {
      [key in keyof T]: { [innerKey in keyof T[key]]: innerKey };
    }),
  };
};

/**
 * Transforms cva variant props into an enum-like object.
 * It's not a true TS enum, but has the same effect with good intellisense.
 * e.g. { mode: { primary: "primary", secondary: "secondary" } }
 */
const getEnums = <T>(obj: T) => {
  const enums: { [key: string]: { [key: string]: string } } = {};

  for (const key in obj) {
    enums[key] = {};
    for (const innerKey in obj[key]) {
      enums[key][innerKey] = innerKey;
    }
  }

  return enums;
};

/**
 * Transforms cva variants object into a format that Storybook can understand
 * for generating stories with dropdown controls based on the variant options
 */
export const cvaOptionsToStorybook = <T>(obj: ReturnType<typeof cva<T>>) => {
  const result: { [key: string]: { type: string; options: string[] } } = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variants, ...variantProps } = obj as {
    variants: any;
    [key: string]: any;
  };

  for (const prop in variantProps) {
    result[prop] = {
      type: "selection",
      options: Object.keys(variantProps[prop]),
    };
  }

  return result;
};

export * from "class-variance-authority";
