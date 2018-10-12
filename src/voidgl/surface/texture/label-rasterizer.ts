import { Label } from "../../primitives/label";
import { LabelAtlasResource } from "./label-atlas-resource";

let canvas: CanvasRenderingContext2D;
const MAX_FONT_SIZE = 50;
const { floor, max, min } = Math;

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
      await new Promise(resolve => setTimeout(resolve, 10));
    }
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
  static calculateLabelSize(
    resource: LabelAtlasResource,
    sampleScale?: number,
    calculateTexture?: boolean
  ) {
    // If a max width is specified, then we must render and determine the potentially truncated text of the
    // Label. We can do a binary search for the correct truncated label size.
    if (calculateTexture) {
      this.calculateTrucatedText(resource);
    }

    /** Get the label properties for rasterizing */
    const label = resource.label;
    // Get the scaling of the sample base
    const sampleScaling = sampleScale || resource.sampleScale || 1.0;
    // Draw our label to a canvas
    this.drawLabel(label, resource.truncatedText, canvas, sampleScaling);
    // Measure the contents of the canvas
    const { minX, minY, maxX, maxY } = this.measureContents(canvas);

    // Make sure the rasterization object is initialized
    resource.rasterization = resource.rasterization || {
      texture: { height: 0, width: 0 },
      world: { height: 0, width: 0 }
    };

    // When a forced sampling is present, it calculates that as the world space
    if (!calculateTexture) {
      // Update the calculated texture size.
      resource.rasterization.world = {
        height: maxY - minY,
        width: maxX - minX
      };
    } else {
      // Otherwise we first calculate the texture rasterization for the label
      // Update the calculated texture size.
      resource.rasterization.texture = {
        height: maxY - minY,
        width: maxX - minX
      };

      resource.rasterization.canvas = this.createCroppedCanvas(
        resource,
        minY,
        minX
      );
      this.calculateLabelSize(resource, 1.0, false);
    }
  }

  /**
   * This determines what the truncated text of the label will be. If there is no truncation
   * then the truncated text === the label's text
   */
  static calculateTrucatedText(resource: LabelAtlasResource) {
    const label = resource.label;
    const maxWidth = label.maxWidth;

    // If the label has no max width, then there will be no truncation
    if (!maxWidth) {
      resource.truncatedText = label.text;
      return;
    }

    // We now do an initial rendering of the label as it will appear in world space
    this.drawLabel(label, label.text, canvas, 1);
    // We measure the contents of the rendered item to see if it violates the maxWidth
    const firstTest = this.measureContents(canvas);

    // If we're within spec, we do not need to truncate
    if (firstTest.maxX - firstTest.minX <= maxWidth) {
      resource.truncatedText = label.text;
      return;
    }

    // At this point we need to binary search through chopping off letters to find a string
    // That will fit within max width
    const text = label.text;
    let left = 0;
    let right = text.length;
    let cursor = floor((right - left) / 2.0);
    let safety = 0;
    const safetyMax = 50;

    // Loop to perform the binary search
    while (right > left && cursor !== 0 && safety++ < safetyMax) {
      // Draw and measure
      this.drawLabel(label, `${text.substr(0, cursor)}...`, canvas, 1);
      const { minX, maxX } = this.measureContents(canvas);

      // If we pass then we move left to cursor to make the test string longer
      if (maxX - minX <= maxWidth) {
        left = cursor;
      } else {
        // If we fail, we move right to cursor to make the test string shorter
        right = cursor;
      }

      // Get our next cursor position
      const nextCursor = floor((right - left) / 2.0) + left;

      // If the next cursor is the same as cursor, then we're done searching
      if (nextCursor === cursor) {
        break;
      }

      // Move our cursor
      cursor = nextCursor;
    }

    // If cursor is zero, nothing passed and our truncation is just ellipses
    if (cursor === 0) {
      resource.truncatedText = "...";
    } else {
      // Otherwise we get the string that passes and use that as our truncated text
      resource.truncatedText = `${text.substr(0, cursor)}...`;
    }
  }

  /**
   * This generates a canvas that has the cropped version of the label where the label
   * fits neatly in the canvas object.
   */
  static createCroppedCanvas(
    resource: LabelAtlasResource,
    top: number,
    left: number
  ) {
    const cropped = document.createElement("canvas");
    const context = cropped.getContext("2d");

    if (context) {
      const texture = resource.rasterization.texture;
      cropped.width = texture.width;
      cropped.height = texture.height;
      context.imageSmoothingEnabled = false;

      // Draw just the region the label appears into the canvas
      context.drawImage(
        canvas.canvas,
        left,
        top,
        texture.width,
        texture.height,
        0,
        0,
        texture.width,
        texture.height
      );
    } else {
      console.warn(
        "Could not create a canvas 2d context to generate a label's cropped image."
      );
    }

    return cropped;
  }

  /**
   * This actually renders a string to a canvas context using a label's settings
   */
  static drawLabel(
    label: Label,
    text: string,
    canvas: CanvasRenderingContext2D,
    sampleScaling: number
  ) {
    // Get the font size we will rasterize with
    const fontSize = this.getLabelRasterizationFontSize(label, sampleScaling);
    // Set the color of the label to white so we know what color to look for
    canvas.fillStyle = "white";
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
    canvas.fillStyle = "white";
    // Set the font to the canvas
    canvas.font = this.makeCSSFont(label, sampleScaling);
    // Render the text into our canvas for calculating
    canvas.fillText(text, fontSize / 2.0, fontSize / 4.0 + fontSize);
  }

  /**
   * Attempts to populate the 'canvas' context for rendering labels offscreen.
   */
  static getContext() {
    if (!canvas) {
      const potentialCanvas = document.createElement("canvas").getContext("2d");

      if (potentialCanvas) {
        canvas = potentialCanvas;
      }

      return potentialCanvas;
    }

    return canvas;
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
    return `${label.fontWeight} ${this.getLabelRasterizationFontSize(
      label,
      sampleScale
    )}px ${label.fontFamily}`;
  }

  /**
   * This measures the contents of what is inside the canvas assumming the rendered values are only white
   */
  static measureContents(canvas: CanvasRenderingContext2D) {
    const { width, height } = canvas.canvas;
    const imageData = canvas.getImageData(0, 0, width, height).data;
    let r;

    let minY = Number.MAX_SAFE_INTEGER;
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

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

    minY = max(minY, 0);
    minX = max(minX, 0);

    return { minX, minY, maxX, maxY };
  }

  /**
   * Performs the rendering of the label
   */
  static async render(
    resource: LabelAtlasResource
  ): Promise<LabelAtlasResource> {
    // Make sure our canvas object is ready for rendering
    await this.awaitContext();

    // Validate the label's input
    if (resource.label.fontSize > MAX_FONT_SIZE) {
      console.warn("Labels only support font sizes up to 50");
      return resource;
    }

    // Calculate all of the label metrics and generate a canvas on the label that can
    // Be rendered to the canvas.
    this.calculateLabelSize(resource, resource.sampleScale, true);

    return resource;
  }

  /**
   * Performs the rendering of the label
   */
  static renderSync(resource: LabelAtlasResource): LabelAtlasResource {
    // Ensure our offscreen canvas is prepped
    this.getContext();

    if (!canvas) {
      console.warn(
        "Can not render a label synchronously without the canvas context being ready."
      );
      return resource;
    }

    // Validate the label's input
    if (resource.label.fontSize > MAX_FONT_SIZE) {
      console.warn("Labels only support font sizes up to 50");
      return resource;
    }

    // Calculate all of the label metrics and generate a canvas on the label that can
    // Be rendered to the canvas.
    this.calculateLabelSize(resource, resource.sampleScale, true);

    return resource;
  }
}
