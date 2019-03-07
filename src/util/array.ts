/**
 * This file will contain convenience operations for manipulating arrays of any sort.
 * These methods are tested to be the fastest (currently known) version to accomplish
 * a goal.
 */

 /**
  * This method flattens a 2D depth of data.
  */
export function flatten2D<T>(array: T[][]) {
  const c = [];

  for (let i = 0, end = array.length; i < end; ++i) {
    const temp = array[i];

    for (let k = 0, endk = temp.length; k < endk; ++k) {
      c.push(temp[k]);
    }
  }

  return c;
}
