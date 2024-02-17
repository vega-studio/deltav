export type Lookup<T> = {
  [key: string]: T | Lookup<T>;
};

/**
 * This gets all of the values of a Lookup. Requires a typeguard to ensure output
 * matches the proper return type.
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

        if (!added.has(value)) {
          nextChunk.push([`${next[0]}.${key}`, value]);
          added.add(value);
        } else {
          error = true;
          console.warn("Invalid lookup for BasicSurface detected:", label);
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
