function isFunction(val: any): val is Function {
  return typeof val === "function";
}

export function when<TTest, T, U>(
  condition: TTest | null | undefined,
  value: ((condition: TTest) => T) | T
): T | U | undefined;
export function when<TTest, T, U>(
  condition: TTest | null | undefined,
  value: ((condition: TTest) => T) | T,
  otherwise: (() => U) | U
): T | U;

/**
 * Cleans up ternary operators in JSX with a when statement. First argument is
 * any truthy value and the value is either the value directly or a callback
 * returning the value.
 *
 * Use a callback to prevent evaluation of the value if the condition does not
 * return. Use a value and not a callback if there is no evaluation when the
 * value is returned.
 *
 * An example of when it's better to not evaluate the returned value is when the
 * value is JSX where inherent React.createElements will be called if just a
 * value was returned.
 */
export function when<TTest, T, U>(
  condition: TTest | null | undefined,
  value: ((condition: TTest) => T) | T,
  otherwise?: (() => U) | U
): T | U | undefined {
  if (condition) {
    if (isFunction(value)) {
      return value(condition);
    } else {
      return value;
    }
  } else if (otherwise) {
    if (isFunction(otherwise)) {
      return otherwise();
    } else {
      return otherwise;
    }
  }

  return;
}
