import { Color } from "../../primitives/color";
import { ColorAtlasResource } from "./color-atlas-resource";

// When ratserized to the image, this determines the size of the square rendered to the atlas.
const COLOR_RASTERIZATION_SIZE = 2;

/**
 * Static class for rasterizing a color to a canvas object
 */
export class ColorRasterizer {
  /**
   * This loops until our canvas context is available
   */
  static async awaitContext(canvas: HTMLCanvasElement) {
    // Iterate till the browser provides a valid canvas to render elements into
    for (
      let c = canvas.getContext("2d"), limit = 0;
      !Boolean(c) && limit < 100;
      c = canvas.getContext("2d"), ++limit
    ) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Generates the CSS string version of the color
   */
  static makeCSS(color: Color) {
    return `rgba(${Math.floor(color.r * 256)}, ${Math.floor(
      color.g * 256
    )}, ${Math.floor(color.b * 256)}, ${color.opacity})`;
  }

  static async render(resource: ColorAtlasResource) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    await this.awaitContext(canvas);

    if (context) {
      canvas.width = COLOR_RASTERIZATION_SIZE;
      canvas.height = COLOR_RASTERIZATION_SIZE;
      context.imageSmoothingEnabled = false;
      context.fillStyle = this.makeCSS(resource.color);

      // Draw the color to the fill space
      context.fillRect(
        0,
        0,
        COLOR_RASTERIZATION_SIZE,
        COLOR_RASTERIZATION_SIZE
      );
      // Update the resource with the rasterization
      resource.rasterization.canvas = canvas;
    } else {
      console.warn(
        "Could not create a canvas 2d context to generate a color for rasterization."
      );
    }

    return resource;
  }
}
