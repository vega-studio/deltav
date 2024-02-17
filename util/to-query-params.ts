import { template } from "./template.js";

function isString(val: any): val is string {
  return val && val.substr !== void 0;
}

export type QueryParams =
  | Map<string, string | string[] | undefined>
  | Record<string, string | string[] | undefined>;

/**
 * Convert a map or an object to query params to send to the server. Provide
 * tokens to automatically replace ${tokens} in the values of params before
 * encoding occurs.
 *
 * Set repeatLists to cause
 */
export function toQueryParams(
  params?: QueryParams,
  tokens?: Record<string, string>,
  excludeEmpty?: boolean,
  repeatLists?: boolean
) {
  if (!params) return "";
  const out: string[] = [];

  if (params instanceof Map) {
    if (params.size <= 0) return "";
    params.forEach((v, k) => {
      if (v === void 0 || (excludeEmpty && !v)) return;

      if (Array.isArray(v)) {
        if (repeatLists) {
          v.forEach((i) => {
            if (i === void 0 || (excludeEmpty && !i)) return;
            out.push(
              `${k}=${encodeURIComponent(
                tokens ? template({ template: i, options: tokens }).template : i
              )}`
            );
          });
        } else {
          out.push(
            `${k}=${v
              .map((val) =>
                encodeURIComponent(
                  tokens
                    ? template({ template: val, options: tokens }).template
                    : val
                )
              )
              .join(",")}`
          );
        }
      } else if (isString(v)) {
        out.push(
          `${k}=${encodeURIComponent(
            tokens ? template({ template: v, options: tokens }).template : v
          )}`
        );
      }
    });
  } else {
    const keys = Object.keys(params);
    if (keys.length <= 0) return "";

    keys.forEach((k) => {
      const v = params[k];
      if (v === void 0 || (excludeEmpty && !v)) return;

      if (Array.isArray(v)) {
        if (repeatLists) {
          v.forEach((i) => {
            if (i === void 0 || (excludeEmpty && !i)) return;
            out.push(
              `${k}=${encodeURIComponent(
                tokens ? template({ template: i, options: tokens }).template : i
              )}`
            );
          });
        } else {
          out.push(
            `${k}=${v
              .map((val) =>
                encodeURIComponent(
                  tokens
                    ? template({ template: val, options: tokens }).template
                    : val
                )
              )
              .join(",")}`
          );
        }
      } else if (isString(v)) {
        out.push(
          `${k}=${encodeURIComponent(
            tokens ? template({ template: v, options: tokens }).template : v
          )}`
        );
      }
    });
  }

  if (out.length <= 0) return "";
  return `?${out.join("&")}`;
}

/**
 * Loops through query params and modifies their values to replace any found
 * ${tokens}.
 */
export function tokenizeQueryParams(
  params?: QueryParams,
  tokens?: Record<string, string>
): QueryParams {
  if (!params) return {};
  const out: Record<string, string | string[] | undefined> = {};

  if (params instanceof Map) {
    params.forEach((v, k) => {
      if (v === void 0) return;

      if (Array.isArray(v)) {
        out[k] = v.map((i) =>
          tokens ? template({ template: i, options: tokens }).template : i
        );
      } else if (isString(v)) {
        out[k] = tokens
          ? template({ template: v, options: tokens }).template
          : v;
      }
    });
  } else {
    const keys = Object.keys(params);
    if (keys.length <= 0) return {};

    keys.forEach((k) => {
      const v = params[k];
      if (v === void 0) return;

      if (Array.isArray(v)) {
        out[k] = v.map((i) =>
          tokens ? template({ template: i, options: tokens }).template : i
        );
      } else if (isString(v)) {
        out[k] = tokens
          ? template({ template: v, options: tokens }).template
          : v;
      }
    });
  }

  return out;
}
