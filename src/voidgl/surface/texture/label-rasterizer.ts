import { LabelAtlasResource } from '.';
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
   * This loops until our canvas context is available
   */
  static async awaitContext() {
    // Iterate till the browser provides a valid canvas to render elements into
    while (!canvas) {
      this.getContext();
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Attempts to populate the 'canvas' context for rendering labels offscreen.
   */
  static getContext() {
    if (!canvas) {
      canvas = document.createElement('canvas').getContext('2d');
    }

    return canvas;
  }

  /**
   * This renders our label to a sizeable canvas where we loop over the pixel data to determine
   * the bounds of the label.
   *
   * @param {boolean} calculateWorld This is used within the method. It switches from calculating
   *                                 the size to be rendered to the texture to the size the label
   *                                 should be within world space.
   * @param {number} sampleScale     INTERNAL: Do not use this parameter manually.
   */
  static calculateLabelSize(resource: LabelAtlasResource, sampleScale?: number) {
    /** Get the label properties for rasterizing */
    const label = resource.label;
    // Get the scaling of the sample base
    const sampleScaling = sampleScale || resource.sampleScale || 1.0;
    // Get the font size will will rasterize with
    const fontSize = this.getLabelRasterizationFontSize(label, sampleScaling);
    // Set the color of the label to white so we know what color to look for
    canvas.fillStyle = 'white';
    // Set the font to the canvas
    canvas.font = this.makeCSSFont(label, sampleScaling);
    // We will use the canvas measuring tool to give us a baseline for how wide
    // The label will be. We add the font size to the width for the padding needed to ensure
    // The entirety of the text is placed on the canvas.
    canvas.canvas.width = canvas.measureText(label.text).width + fontSize;
    // Make our test area the font size with one extra level of the font size
    // For padding.
    canvas.canvas.height = fontSize * 2.0;
    // After adjusting the canvas dimensions we must re-set the font metrics
    // Set the color of the label to white so we know what color to look for
    canvas.fillStyle = 'white';
    // Set the font to the canvas
    canvas.font = this.makeCSSFont(label, sampleScaling);
    // Render the text into our canvas for calculating
    canvas.fillText(label.text, fontSize / 2.0, fontSize / 4.0 + fontSize);

    // We will now render to our canvas with enough padding to ensure
    const { width, height } = canvas.canvas;
    const imageData = canvas.getImageData(0, 0, width, height).data;
    let r;

    let minY = Number.MAX_SAFE_INTEGER;
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    const {min, max} = Math;

    for (let i = 0; i < width; ++i) {
      for (let k = 0; k < height; ++k) {
        const redIndex = k * (width * 4) + i * 4;
        r = imageData[redIndex];

        if (r > 0.0) {
          minY = min(minY, k);
          minX = min(minX, i);
          maxX = max(maxX, i);
          maxY = max(maxY, k);
        }
      }
    }

    // The identified pixel needs to be encased and not a direct target
    minY -= 1;
    maxY += 2;
    maxX += 2;
    minX -= 1;

    minY = Math.max(minY, 0);
    minX = Math.max(minX, 0);

    // Make sure the rasterization object is initialized
    resource.rasterization = resource.rasterization || {
      texture: { height: 0, width: 0},
      world: { height: 0, width: 0},
    };

    // When a forced sampling is present, it calculates that as the world space
    if (sampleScaling) {
      // Update the calculated texture size.
      resource.rasterization.world = {
        height: maxY - minY,
        width: maxX - minX,
      };
    }

    // Otherwise we first calculate the texture rasterization for the label
    else {
      // Update the calculated texture size.
      resource.rasterization.texture = {
        height: maxY - minY,
        width: maxX - minX,
      };

      resource.rasterization.canvas = this.createCroppedCanvas(resource, minY, minX);
      this.calculateLabelSize(resource, 1.0);
    }
  }

  /**
   * This generates a canvas that has the cropped version of the label where the label
   * fits neatly in the canvas object.
   */
  static createCroppedCanvas(resource: LabelAtlasResource, top: number, left: number) {
    const cropped = document.createElement('canvas');
    const context = cropped.getContext('2d');

    if (context) {
      const texture = resource.rasterization.texture;
      cropped.width = texture.width;
      cropped.height = texture.height;
      context.imageSmoothingEnabled = false;

      // Draw just the region the label appears into the canvas
      context.drawImage(
        canvas.canvas,
        left, top, texture.width, texture.height,
        0, 0, texture.width, texture.height,
      );
    }

    else {
      console.warn('Could not create a canvas 2d context to generate a label\'s cropped image.');
    }

    return cropped;
  }

  /**
   * This retrieves the font size that will be used when rasterizing the label. This takes into
   * account whether the label is requesting super sampling be present for the rendering.
   */
  static getLabelRasterizationFontSize(label: Label, sampleScale: number) {
    return label.fontSize * sampleScale;
  }

  /**
   * Generates the CSS font string based on the label's values
   */
  static makeCSSFont(label: Label, sampleScale: number) {
    return `${label.fontWeight} ${this.getLabelRasterizationFontSize(label, sampleScale)}px ${label.fontFamily}`;
  }

  /**
   * Performs the rendering of the label
   */
  static async render(resource: LabelAtlasResource): Promise<LabelAtlasResource> {
    // Make sure our canvas object is ready for rendering
    await this.awaitContext();

    // Validate the label's input
    if (resource.label.fontSize > MAX_FONT_SIZE) {
      console.warn('Labels only support font sizes up to 50');
      return resource;
    }

    // Calculate all of the label metrics and generate a canvas on the label that can
    // Be rendered to the canvas.
    this.calculateLabelSize(resource);

    return resource;
  }

  /**
   * Performs the rendering of the label
   */
  static renderSync(resource: LabelAtlasResource): LabelAtlasResource {
    // Ensure our offscreen canvas is prepped
    this.getContext();

    if (!canvas) {
      console.warn('Can not render a label synchronously without the canvas context being ready.');
      return;
    }

    // Validate the label's input
    if (resource.label.fontSize > MAX_FONT_SIZE) {
      console.warn('Labels only support font sizes up to 50');
      return resource;
    }

    // Calculate all of the label metrics and generate a canvas on the label that can
    // Be rendered to the canvas.
    this.calculateLabelSize(resource);

    return resource;
  }
}
