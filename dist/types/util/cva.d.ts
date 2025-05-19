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
export declare const cva: <T>(...args: Parameters<typeof cvaPackage<T>>) => {
    variants: (props?: (T extends {
        [x: string]: Record<string, import("clsx").ClassValue>;
    } ? { [Variant in keyof T]?: import("class-variance-authority/dist/types").StringToBoolean<keyof T[Variant]> | null | undefined; } & import("class-variance-authority/dist/types").ClassProp : import("class-variance-authority/dist/types").ClassProp) | undefined) => string;
    defaults: { [Variant in keyof T]?: import("class-variance-authority/dist/types").StringToBoolean<keyof T[Variant]> | null | undefined; } | undefined;
} & { [key in keyof T]: { [innerKey in keyof T[key]]: innerKey; }; };
/**
 * Transforms cva variants object into a format that Storybook can understand
 * for generating stories with dropdown controls based on the variant options
 */
export declare const cvaOptionsToStorybook: <T>(obj: ReturnType<typeof cva<T>>) => {
    [key: string]: {
        type: string;
        options: string[];
    };
};
export * from "class-variance-authority";
