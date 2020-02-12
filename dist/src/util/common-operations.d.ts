/**
 * Method for handling retrieving a map value. This will inject a provided default value if the key does not return
 * a valid value. This will not work as expected if 'undefined' is a valid expected value.
 */
export declare function mapInjectDefault<T, U>(map: Map<T, U>, key: T, defaultValue: U | (() => U)): U;
/**
 * Method for handling retrieving a map value. This will provide a provided default value with no mutation to the map.
 * This will not work as expected if 'undefined' is a valid expected value.
 */
export declare function mapGetWithDefault<T, U>(map: Map<T, U>, key: T, defaultValue: U | (() => U)): U;
