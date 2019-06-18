function isFunction(val: any): val is Function {
  return val && val.constructor instanceof Function;
}

/**
 * Method for handling retrieving a map value. This will inject a provided default value if the key does not return
 * a valid value. This will not work as expected if 'undefined' is a valid expected value.
 */
export function mapInjectDefault<T, U>(
  map: Map<T, U>,
  key: T,
  defaultValue: U | (() => U)
): U {
  let value = map.get(key);

  if (value === undefined) {
    if (isFunction(defaultValue)) {
      value = defaultValue();
    } else {
      value = defaultValue;
    }

    map.set(key, value);
  }

  return value;
}

/**
 * Method for handling retrieving a map value. This will provide a provided default value with no mutation to the map.
 * This will not work as expected if 'undefined' is a valid expected value.
 */
export function mapGetWithDefault<T, U>(
  map: Map<T, U>,
  key: T,
  defaultValue: U | (() => U)
): U {
  let value = map.get(key);

  if (value === undefined) {
    if (isFunction(defaultValue)) {
      value = defaultValue();
    } else {
      value = defaultValue;
    }
  }

  return value;
}
