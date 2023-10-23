function hasErrorInfo(e: any): e is Error {
  return e && (e.message || e.stack);
}

function canBeString(e: any): e is { toString(): string } {
  return e && typeof e.toString === "function";
}

/**
 * Errors can not have a type specified in the try catch clause. This makes
 * outputting an error message safe and easier to type by doing validations
 * necessary to get a standard error's error message or stack.
 */
export function getErrorMessage(e: unknown): string {
  if (hasErrorInfo(e)) {
    return e.stack || e.message;
  }

  try {
    return JSON.stringify(e, null, 2);
  } catch (err) {
    // NOOP
  }

  if (canBeString(e)) {
    return e.toString();
  }

  return "";
}
