export class PascalTriangle {
  /** Contains the triangles elements [[1], [1, 1], [1, 2, 1], etc] */
  elements: number[][] = [];

  constructor(levels: number) {
    if (levels === 0) return;
    const elements: number[][] = [[1]];
    const _levels = levels - 1;

    // i will be the index pointing to the previous row
    for (let i = 0; i < _levels; ++i) {
      const previous = elements[i];
      const row = [1];

      for (let k = 0, endk = previous.length - 1; k < endk; ++k) {
        row.push(previous[k] + previous[k + 1]);
      }

      row.push(1);
      elements.push(row);
    }

    this.elements = elements;
  }

  /**
   * Tries to generate a gaussian kernal based on the pascal triangle where the kernal has so many elements
   * To get a higher quality kernal trim off the ends of the triangle's row but keep the kernal number.
   * This causes a deeper triangle to be calculated.
   */
  gaussianKernal(size: number, trim: number) {
    const toTrim = trim * 2;
    let row: number[] = [];

    // Loop until we hit a row with enough elements to make the kernal
    for (
      let i = 0, end = this.elements.length;
      i < end && this.elements[i].length - toTrim <= size;
      ++i
    ) {
      row = this.elements[i];
    }

    // Make sure the elements matches the requested elements size exactly
    if (row.length - toTrim !== size) {
      console.warn(
        "Error in pascal triangle gaussian kernal",
        "Requested size",
        size,
        "Row",
        row,
        "Trim amount",
        trim,
        "Elements",
        this.elements
      );
    }

    // Copy and remove trimed elements
    let kernal = row.slice(trim, row.length - trim);
    // Get the new total of the row
    const total = kernal.reduce((prev, next) => next + prev, 0);
    // Normalize the kernal
    kernal = kernal.map((value) => value / total);

    return {
      kernal,
      total,
    };
  }
}
