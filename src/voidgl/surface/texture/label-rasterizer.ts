import { Label } from '../../primitives/label';

let canvas: CanvasRenderingContext2D;
const MAX_FONT_SIZE = 50;

export interface ILabelRasterizedMetrics {
  canvas: HTMLCanvasElement;
  height: number;
  width: number;
}

export class LabelRasterizer {
  /**
   * This renders our label to a sizeable canvas where we loop over the pixel data to determine
   * the bounds of the label.
   */
  static calculateLabelSize(label: Label) {
    // Helper method for picking pixels from our image data
    function getColorIndicesForCoord(x: number, y: number, width: number) {
      const red = y * (width * 4) + x * 4;
      return [red, red + 1, red + 2, red + 3];
    }

    // Set the font to the canvas
    canvas.font = this.makeCSSFont(label);
    // Set the color of the label to white so we know what color to look for
    canvas.fillStyle = 'white';
    // Get the font size will will rasterize with
    const fontSize = this.getLabelRasterizationFontSize(label);
    // Make our test area the font size with one extra level of the font size
    // For padding.
    canvas.canvas.height = fontSize * 2.0;
    // We will use the canvas measuring tool to give us a baseline for how wide
    // The label will be. We add the font size to the width for the padding needed to ensure
    // The entirety of the text is placed on the canvas.
    canvas.canvas.width = canvas.measureText(label.text).width + fontSize;

    // We will now render to our canvas with enough padding to ensure
    const { width, height } = canvas.canvas;
    const imageData = canvas.getImageData(0, 0, width, height).data;
    let r;

    let firstHitY = -1;
    let leastX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    const {min, max} = Math;

    for (let i = 0; i < width; ++i) {
      for (let k = 0; k < height; ++k) {
        const redIndex = k * (width * 4) + i * 4;
        r = imageData[redIndex];

        if (r === 255.0) {
          if (firstHitY === -1) firstHitY = k;
          leastX = min(leastX, i);
          maxX = max(maxX, i);
          maxY = max(maxY, k);
        }
      }
    }
  }

  /**
   * This retrieves the font size that will be used when rasterizing the label. This takes into
   * account whether the label is requesting super sampling be present for the rendering.
   */
  static getLabelRasterizationFontSize(label: Label) {
    return label.superSample ? label.fontSize * 4 : label.fontSize;
  }

  /**
   * Makes a small canvas piece to render the label into and returns the canvas context if successful.
   */
  static makeCanvasFromLabel(label: Label) {
    const labelSize = label.rasterization.texture;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set the dimensions of the canvas/texture space we will be using to rasterize
    // The label. Use the label's rasterization controls to aid in rendering the label
    canvas.width = labelSize.width;
    canvas.height = labelSize.height;

    if (ctx) {
      const color = rgb(
        label.color.base.color.r * 255,
        label.color.base.color.g * 255,
        label.color.base.color.b * 255,
        label.color.base.opacity,
      );

      ctx.font = label.makeCSSFont(label);
      ctx.textAlign = label.textAlign;
      ctx.textBaseline = label.textBaseline;
      ctx.fillStyle = color.toString();

      // Render the label to the canvas/texture space. This utilizes the label's
      // Rasterization metrics to aid in getting a clean render.
      ctx.fillText(
        label.truncatedText || label.text,
        texture.label.rasterizationOffset.x,
        texture.label.rasterizationOffset.y,
      );
    }

    return ctx;
  }

  /**
   * Generates the CSS font string based on the label's values
   */
  static makeCSSFont(label: Label) {
    return `${label.fontWeight} ${label.fontSize || this.getLabelRasterizationFontSize(label)}px ${label.fontFamily}`;
  }

  /**
   * Performs the rendering of the label
   */
  static async render(label: Label): Promise<ILabelRasterizedMetrics> {
    // Iterate till the browser provides a valid canvas to render elements into
    while (!canvas) {
      canvas = document.createElement('canvas').getContext('2d');
      await new Promise((resolve) => setTimeout(resolve, 10));
      // We set the canvas height to a resonable height for measuring a blurb of text
      canvas.canvas.height = 250;
    }

    if (label.fontSize > 50) {
      console.warn('Labels only support font sizes up to 75');
      return;
    }

    return {};
  }
}
