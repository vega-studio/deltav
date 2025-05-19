import type { Vec2 } from "../../../src/math/index.js";
import { GaussianBlur } from "./gaussian-blur.js";
import { scaleLinear } from "./scale-linear.js";

const { abs, floor, max, min, random } = Math;

export interface IPerlinOptions {
  /** Output width */
  width: number;
  /** Output height */
  height: number;
  /** The amount of blurring to apply to the combined octaves */
  blendPasses: number;
  /**
   * An octave is the start of perlin noise with a gaussian noise map. Each octave should be smaller
   * than the end result. The octave is then scaled up then averaged with the
   * other octaves. Octaves closer to the output size creates greater detail in regions, while
   * octaves that are smaller creates larger features.
   *
   * Octaves are in the format [width, height]
   */
  octaves: Vec2[];
  /**
   * This sets the values that should appear within the perlin dataset.
   */
  valueRange: Vec2;
}

/**
 * This generates a 2d plane of perlin noise that is gray scale with values
 * that are 0 - 1.
 */
export class PerlinNoise {
  /** The blurring kernal used to blur the data */
  private blur: GaussianBlur;
  /** The perlin data with values 0 - 1 */
  data!: number[][];
  /** Used for debug rendering the output */
  private debugContext!: HTMLCanvasElement;
  /** The options used to construct the data */
  options: IPerlinOptions;

  get width() {
    return this.options.width;
  }

  get height() {
    return this.options.height;
  }

  /**
   * Provide the output size, and the size of the octaves generated.
   */
  constructor(options: IPerlinOptions) {
    this.options = options;
    this.blur = new GaussianBlur({
      passes: options.blendPasses,
      kernalSize: 9,
    });

    this.update(options);
  }

  /**
   * Generates a new perlin dataset
   */
  async generate() {
    const { width, height, octaves, valueRange } = this.options;
    // This will contain the end perlin result
    let perlin: number[][] = [];

    // Loop through each octave and multiply it into the perlin output
    octaves.forEach((octave) => {
      // Start with a smaller sized map of pure gray scale noise
      const small: number[][] = [];
      const smallWidth = octave[0];
      const smallHeight = octave[1];
      const scaleX = scaleLinear([0, width], [0, smallWidth]);
      const scaleY = scaleLinear([0, height], [0, smallHeight]);

      // Make the octave base
      for (let x = 0; x < smallWidth; ++x) {
        const col: number[] = [];
        small.push(col);

        for (let y = 0; y < smallHeight; ++y) {
          col.push(random());
        }
      }

      // Sample the octave into the size of the output perlin image
      for (let x = 0; x < width; ++x) {
        const col = (perlin[x] = perlin[x] || []);

        for (let y = 0; y < height; ++y) {
          col[y] = (col[y] || 1) * small[floor(scaleX(x))][floor(scaleY(y))];
        }
      }
    });

    // Run through the perlin noise data with our blur filter
    perlin = this.blur.generate(perlin);

    // We now normalize the ranges to keep details brighter
    // We also make the data within each cell reflect the data range
    // that is specified
    let maxVal = -1;
    const range = valueRange[1] - valueRange[0];
    const base = valueRange[0];

    for (let x = 0; x < width; ++x) {
      const col = perlin[x];

      for (let y = 0; y < height; ++y) {
        // First brigten up darkened areas
        // perlin[x][y] *= 1 / (perlin[x][y] + 1);
        // Now get the max value
        maxVal = max(col[y], maxVal);
      }
    }

    for (let x = 0; x < width; ++x) {
      const col = perlin[x];

      for (let y = 0; y < height; ++y) {
        col[y] /= maxVal;
        col[y] = col[y] * range + base;
      }
    }

    this.data = perlin;
  }

  /**
   * Will just ensure the data object is populated with a generation.
   */
  async generateOnce() {
    if (!this.data) {
      await this.generate();
    }
  }

  /**
   * Retrieves a rectangular sample from the perlin data.
   * If a threshold is included, absolute values below it will be zero'ed out.
   */
  sample(
    x: number,
    y: number,
    width: number,
    height: number,
    threshold?: number
  ) {
    const out: number[][] = [];

    if (threshold) {
      for (let i = x, end = min(this.data.length, x + width); i < end; ++i) {
        out.push(
          this.data[i]
            .slice(y, y + height)
            .map((value) => (abs(value) > threshold ? value : 0))
        );
      }
    } else {
      for (let i = x, end = min(this.data.length, x + width); i < end; ++i) {
        out.push(this.data[i].slice(y, y + height));
      }
    }

    return out;
  }

  /**
   * Update the options for the noise generation.
   */
  update(options: Partial<IPerlinOptions>) {
    Object.assign(this.options, options);

    if (options.blendPasses) {
      this.blur.update({
        passes: options.blendPasses,
      });
    }
  }

  /**
   * Renders a canvas on the screen showing the generated output.
   */
  debug(threshold = 0, clear?: boolean) {
    if (clear) {
      if (this.debugContext) {
        this.debugContext.remove();
      }
      return;
    }

    const canvas = document.createElement("canvas").getContext("2d");

    if (canvas) {
      const { valueRange } = this.options;
      const element = canvas.canvas;
      document.getElementsByTagName("body")[0].appendChild(canvas.canvas);
      const width = (element.width = this.data.length);
      const height = (element.height = this.data[0].length);
      const data = canvas.getImageData(0, 0, width, height);
      let index = 0;
      const range = valueRange[1] - valueRange[0];
      const base = valueRange[0];

      if (threshold) {
        for (let x = 0, end = this.data.length; x < end; ++x) {
          const col = this.data[x];

          for (let y = 0, endy = col.length; y < endy; ++y) {
            const val = 255 * (abs(col[y]) > threshold ? 1 : 0);
            data.data[index * 4] = val;
            data.data[index * 4 + 1] = val;
            data.data[index * 4 + 2] = val;
            data.data[index * 4 + 3] = 255;
            index++;
          }
        }
      } else {
        for (let x = 0, end = this.data.length; x < end; ++x) {
          const col = this.data[x];

          for (let y = 0, endy = col.length; y < endy; ++y) {
            const val = 255 * ((col[y] - base) / range);
            data.data[index * 4] = val;
            data.data[index * 4 + 1] = val;
            data.data[index * 4 + 2] = val;
            data.data[index * 4 + 3] = 255;
            index++;
          }
        }
      }

      canvas.putImageData(data, 0, 0);
      element.style.position = "fixed";
      element.style.top = "0px";
      element.style.left = "0px";
      element.style.zIndex = "9999";

      this.debugContext = element;
    }
  }
}
