/** Important to start UIDs at 1 so that falsey evaluations do not pass when examining UIDs */
let UID = 1;

/**
 * Provides a 64 bit UID.
 *
 * Note: all uids generated with uid() are unique amongst uid() calls and NOT unique amongst
 * other types of uid calls.
 */
export function uid() {
  return ++UID;
}

let CUID = 0;

/**
 * Provides a 24 bit UID (keeps the UID within non-alpha color ranges)
 *
 * Note: all uids generated with colorUID() are unique amongst colorUID() calls and NOT unique amongst
 * other types of uid calls.
 */
export function colorUID() {
  return ++CUID % 0xffffff;
}
