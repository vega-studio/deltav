import type { Vec2 } from "../../../src";

/**
 * Performs a frequency filtration across a provided streamed in signal.
 * This filter can be adjusted via the seed values provided.
 */
export class FIRFilter {
  coefficients: number[];
  filter: number[];

  /**
   * The seed values work in tuples [FIR filter coefficient, starting bias];
   * When normalize is activated, the seed values are normalized to the provided value.
   * When normalize is a value of 1, this behaves like a low pass FIR filter.
   */
  constructor(seedValues: Vec2[], normalize?: number) {
    this.coefficients = seedValues.map((seed) => seed[0]);
    this.filter = seedValues.map((seed) => seed[1]);

    if (normalize !== undefined) {
      let total = 0;
      this.coefficients.forEach((c) => (total += c));
      this.coefficients = this.coefficients.map((value) => {
        return (value / total) * normalize;
      });
    }
  }

  /**
   * Reset the filter to have all of it's filter values set to the provided value
   */
  reset(value: number) {
    this.filter = this.filter.map(() => value);
  }

  /**
   * This streams in a value into the filter and outputs the next computed value
   */
  stream(value: number) {
    let out = 0;
    this.filter.pop();
    this.filter.unshift(value);

    for (let i = 0, end = this.coefficients.length; i < end; ++i) {
      out += this.coefficients[i] * this.filter[i];
    }

    this.filter.shift();
    this.filter.unshift(out);

    return out;
  }

  /**
   * Runs a list of values through the filter and returns an array of each step
   */
  run(start: number, values: number[]) {
    const current = this.filter.slice(0);
    const toProcess = values.slice(0);
    this.reset(start);
    const out: number[] = [];

    while (toProcess.length > 0) {
      out.push(this.stream(toProcess.shift() || 0));
    }

    // Reset the filter back to where it was
    this.filter = current;

    return out;
  }
}
