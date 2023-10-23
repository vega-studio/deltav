/**
 * A special type that allows deep nesting of identifiers before ultimately
 * landing on a specific type at the leaves of the object.
 */
export type Lookup<T> = { [key: string]: T | Lookup<T> };

/**
 * A very tricky method that maps a Lookup (dictionary with nested keys) to
 * values found in the leaves of the tree of the object.
 */
export function mapLookupValues<T extends object, U>(
  label: string,
  check: (value: T | Lookup<T>) => boolean,
  lookup: Lookup<T>,
  callback: (key: string, value: T) => U
): U[] {
  const added = new Set();
  const out: U[] = [];
  const toProcess = Object.keys(lookup).map<[string, T | Lookup<T>]>((key) => [
    key,
    (lookup as any)[key],
  ]);

  for (let index = 0; index < toProcess.length; ++index) {
    const next = toProcess[index];

    if (check(next[1])) {
      out.push(callback(next[0], next[1] as T));
    } else {
      let error = false;
      const nextChunk: [string, T | Lookup<T>][] = [];

      Object.keys(next[1]).forEach((key) => {
        const value = (next[1] as any)[key];
        // The key is NOT allowed to have periods in the key as the actual
        // identifier of the element.
        const splits = key.split(".");

        if (splits.length > 1) {
          console.warn("Can not use a period in the key of a filter.");
        }

        key = splits.join("");

        if (!added.has(value)) {
          nextChunk.push([`${next[0]}.${key}`, value]);
          added.add(value);
        } else {
          error = true;
          console.warn(
            "Invalid lookup for mapping Lookup values detected:",
            label
          );
        }
      });

      // Inject the next chunk of items at the place of the current process item
      // So we retain the tree order that items appear in
      if (nextChunk.length > 0) {
        toProcess.splice(index + 1, 0, ...nextChunk);
      }

      if (error) break;
    }
  }

  return out;
}
