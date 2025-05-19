import { PascalTriangle } from "./pascal-triangle.js";

export interface IGaussianBlurOptions {
  /** Number of samples taken per data slot */
  kernalSize: number;
  /** Number of times the blur is applied */
  passes: number;
}

const { min, max } = Math;

function clamp(val: number, minVal: number, maxVal: number) {
  return max(min(val, maxVal), minVal);
}

/**
 * Performs a gaussian blur on a set of numerical data.
 */
export class GaussianBlur {
  // This is a blur kernal used for blending
  private kernal: number[] = [];
  // These are the options for the blur operation
  options: IGaussianBlurOptions;

  constructor(options: IGaussianBlurOptions) {
    this.options = options;
    this.update(options);
  }

  /**
   * Applies the blur to the input data, returns a blurred version without affecting the source.
   */
  generate(
    data: number[][],
    offsetLeft = 0,
    offsetTop = 0,
    offsetRight = 0,
    offsetBottom = 0
  ) {
    if (!data || !data[0] || !data[0].length) return data;

    const { passes } = this.options;
    const kernal = this.kernal;
    const outPass = data.map((col) => col.slice(0));
    const width = data.length;
    const height = data[0].length;

    const offsets: { [key: number]: number[] } = {
      1: [0],
      3: [-1, 0, 1],
      5: [-2, -1, 0, 1, 2],
      7: [-3, -2, -1, 0, 1, 2, 3],
      9: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    };
    const offset = offsets[kernal.length];

    if (!offset) {
      console.warn("No offset suitable for kernal size");
      return data;
    }

    // Instantiate our vertical pass so we don't recreate every pass
    const verticalPass: number[][] = [];
    for (let x = 0; x < width; ++x) {
      verticalPass.push([]);
    }

    for (let blurCount = 0; blurCount < passes; ++blurCount) {
      // After the octaves have been loaded in, we can blur filter the result
      let value;
      let sample;

      // Vertical Gaussian blur pass
      for (let x = offsetLeft, endx = width - offsetRight; x < endx; ++x) {
        const outCol = verticalPass[x];
        const inCol = outPass[x];

        for (let y = offsetTop, endy = height - offsetBottom; y < endy; ++y) {
          value = 0;

          for (let k = 0, endk = kernal.length; k < endk; ++k) {
            sample = clamp(y + offset[k], 0, endy - 1);
            value += (inCol[sample] || 0) * kernal[k];
          }

          outCol[y] = value;
        }
      }

      // Horizontal Gaussian blur into our perlin data
      for (let x = offsetLeft, endx = width - offsetRight; x < endx; ++x) {
        const outCol = outPass[x];

        for (let y = offsetTop, endy = height - offsetBottom; y < endy; ++y) {
          value = 0;

          for (let k = 0, endk = kernal.length; k < endk; ++k) {
            sample = clamp(x + offset[k], 0, endx - 1);
            value += ((verticalPass[sample] || [])[y] || 0) * kernal[k];
          }

          outCol[y] = value;
        }
      }
    }

    return outPass;
  }

  update(options: Partial<IGaussianBlurOptions>) {
    Object.assign(this.options, options);

    if (options.kernalSize) {
      // This is a blur kernal that will be used for sampling the zoomed in octaves
      this.kernal = new PascalTriangle(15).gaussianKernal(
        options.kernalSize,
        2
      ).kernal;
    }
  }
}
