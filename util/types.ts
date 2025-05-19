/**
 * Interface for declaring a generic JSON valid object
 */
export interface IJson {
  [x: string]: string | number | boolean | Date | IJson | IJsonArray;
}

/**
 * Interface for declaring a generic JSON valid object
 */
export interface IJsonType {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | IJsonType
    | IJsonArray
    | undefined;
}

/**
 * Part of the IJson declaration to make a valid JSON type.
 */
export type IJsonArray = (
  | string
  | number
  | boolean
  | Date
  | IJson
  | IJsonArray
)[];

/**
 * This is to help establish a custom child pattern for React. The props for your react component simply needs to extend
 * this interface.
 */
export type IChildren<T extends object> = T & {
  children?: Partial<T>;
};

/**
 * This lets you define children for a component and forces the children to be declared in the props as opposed to
 * nesting the children.
 */
export type IPropsChildren<T extends object> = T & {
  children: never;
};

/**
 * This lets you define children for a component and forces the children to be nested as opposed to
 * being declared in the props.
 */
export type INestedChildren<T> = {
  children?: T;
};

/**
 * A slightly stronger type for for indicating "Function". This has greater
 * flexibility to fit into generic callbacks.
 */
export type GenericFunction<T> = (...args: any[]) => T;

/**
 * This type is intended for the async operation of a "flow". A flow can have
 * several yield statements, but are NOT for the intention of returning values
 * to the caller, but rather for the intent of performing a mobx action that has
 * asynchronous properties.
 */
export type FlowType = Generator<unknown, unknown, unknown> | undefined;

/**
 * Typeguard for strings
 */
export function isString(val: any): val is string {
  return val && val.charCodeAt !== void 0;
}

/**
 * Typeguard for numbers
 */
export function isNumber(val: any): val is number {
  return val !== void 0 && val.toExponential;
}

/**
 * Typeguard for functions
 */
export function isFunction(val: any): val is (...args: any[]) => any {
  return typeof val === "function";
}

/**
 * Typegaurd for ensuring an element is non-null and not undefined.
 */
export function isDefined<T>(val: T | undefined | null): val is T {
  return val !== void 0 && val !== null;
}

/**
 * Returns a value if i
 */
export function isTruthy<T>(val: T | null | undefined | false): val is T {
  return Boolean(val);
}
