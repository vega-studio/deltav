/**
 * This normalizes the HeadersInit type to a Record. Empty or undefined values
 * returns an empty object.
 */
export function headersToRecord(
  headersInit?: HeadersInit
): Record<string, string> {
  if (!headersInit) return {};
  const record: Record<string, string> = {};

  // If headersInit is an instance of Headers, iterate and fill the record
  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      record[key] = value;
    });
  } else {
    // If headersInit is an array or plain object, assign it directly
    Object.assign(record, headersInit);
  }

  return record;
}
