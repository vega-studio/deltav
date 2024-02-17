/**
 * This forces a flow to completion with the final yield value returned.
 */
export async function rush<T>(generator: Iterable<T>) {
  let value: any;

  for await (const val of generator) {
    value = val;
  }

  return value;
}
