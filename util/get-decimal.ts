/**
 * Simple function for getting a number up to a certain decimal. This properly
 * returns a number to work with. This is for special formatting and should not
 * be used for mathematical operations.
 *
 * This specifically rounds up the final decimal value.
 */
export function getDecimal(value: number | string, decimalPlaces: number) {
  let val = Number.parseFloat(value as string);
  if (isNaN(val)) return Number.NaN;
  const places = Math.pow(10, decimalPlaces);
  val = Math.ceil(val * places);
  val /= places;

  // Typescript wrongly states parseFloat only accepts string. Number is a valid
  // format for this method.
  return val;
}
