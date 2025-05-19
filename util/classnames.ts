type ClassOption =
  | string
  | undefined
  | null
  | Record<string, boolean | null | undefined>;

function isString(v: any): v is string {
  return v.charCodeAt !== void 0;
}

/**
 * This takes several arguments and concatenates them into a single css class
 * name compatible string. It will remove any falsy values and will trim any
 * whitespace.
 */
export function classnames(...str: ClassOption[]): string {
  let out = "";
  let c, k;
  let i = 0;
  const iMax = str.length;

  while (i < iMax) {
    if ((c = str[i++])) {
      if (isString(c)) {
        if (out) out += " ";
        out += c;
      } else {
        for (k in c) {
          if (c[k]) {
            if (out) out += " ";
            out += k;
          }
        }
      }
    }
  }

  return out;
}
