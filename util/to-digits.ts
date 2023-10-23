/**
 * Makes a string from a number and adds leading zeros as necessary.
 */
export function toDigits(n: number, digits: number): string {
  let s = `${n}`;

  while (s.length < digits) {
    s = `0${s}`;
  }

  return s;
}
