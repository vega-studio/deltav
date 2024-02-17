/**
 * Parses the current cookies for this application into an easier to use JSON
 * object.
 *
 * If a cookie is not passed as an argument, this will parse the cookie found on
 * the document (in browser. In Node an argument is required).
 */
export function cookieParser(manual?: string) {
  let cookie = manual;

  if (!cookie) {
    if (document && document.cookie) {
      cookie = document.cookie;
    } else return {};
  }

  try {
    return cookie
      .split(";")
      .map((v) => v.split("="))
      .reduce(
        (acc, v) => {
          acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(
            v[1].trim()
          );
          return acc;
        },
        {} as Record<string, string>
      );
  } catch (err) {
    console.error("Unexpected cookie format");
  }

  return {};
}
