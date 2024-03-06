type StrictNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type NonNullablePick<T, K extends keyof T> = StrictNonNullable<Pick<T, K>>;

/**
 * Returns an object that only contains the keys specified. This only works for
 * a single depth edit.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: Partial<Pick<T, K>> = {};

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  });

  return result as Pick<T, K>;
}

/**
 * Returns an object that only contains the keys specified. This only works for
 * a single depth edit.
 *
 * This enforces that the picked elements are not null or undefined.
 */
export function strictPick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  defaults: NonNullablePick<T, K>
): NonNullablePick<T, K> {
  const result: NonNullablePick<T, K> = {} as any;

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key] || defaults[key];
    }
  });

  return result as NonNullablePick<T, K>;
}
