import { ImageAtlasResource } from '.';

let canvas: CanvasRenderingContext2D;

export interface IImageRasterizedMetrics {
  canvas: HTMLCanvasElement;
  height: number;
  width: number;
}

export class ImageRasterizer {
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
   * Attempts to populate the 'canvas' context for rendering images offscreen.
   */
  static getContext() {
    if (!canvas) {
      canvas = document.createElement('canvas').getContext('2d');
    }

    return canvas;
  }

  /**
   * This renders our image to a sizeable canvas where we loop over the pixel data to determine
   * the bounds of the image.
   *
   * @param {boolean} calculateWorld This is used within the method. It switches from calculating
   *                                 the size to be rendered to the texture to the size the image
   *                                 should be within world space.
   * @param {number} sampleScale     INTERNAL: Do not use this parameter manually.
   */
  static calculateImageSize(resource: ImageAtlasResource, sampleScale?: number, calculateTexture?: boolean) {
    /** Get the image properties for rasterizing */
    const image = resource.image.element;

    if (image.width === 0 || image.height === 0) {
      console.warn('Images provided shoud have valid dimensions! Please ensure the image is loaded first.');
      return;
    }

    // Just make sure th canvas is available
    canvas.canvas.width = 100;
    canvas.canvas.height = 100;
    // Render the image into our canvas merely to ensure the image can be rendered
    // This action often 'warms up' images such as images that have a data URL instead of a path
    canvas.drawImage(image, 0, 0);

    // Make sure the rasterization object is initialized
    resource.rasterization = resource.rasterization || {
      texture: { height: 0, width: 0},
      world: { height: 0, width: 0},
    };

    // When a forced sampling is present, it calculates that as the world space
    if (!calculateTexture) {
      // Update the calculated texture size.
      resource.rasterization.world = {
        height: image.height,
        width: image.width,
      };
    }

    // Otherwise we first calculate the texture rasterization for the image
    else {
      // Update the calculated texture size.
      resource.rasterization.texture = {
        height: image.height * resource.sampleScale,
        width: image.width * resource.sampleScale,
      };

      resource.rasterization.image = image;
    }
  }

  /**
   * This generates a canvas that has the cropped version of the image where the image
   * fits neatly in the canvas object.
   */
  static createCroppedCanvas(resource: ImageAtlasResource, top: number, left: number) {
    const cropped = document.createElement('canvas');
    const context = cropped.getContext('2d');

    if (context) {
      const texture = resource.rasterization.texture;
      cropped.width = texture.width;
      cropped.height = texture.height;
      context.imageSmoothingEnabled = false;

      // Draw just the region the image appears into the canvas
      context.drawImage(
        canvas.canvas,
        left, top, texture.width, texture.height,
        0, 0, texture.width, texture.height,
      );
    }

    else {
      console.warn('Could not create a canvas 2d context to generate a image\'s cropped image.');
    }

    return cropped;
  }

  /**
   * Performs the rendering of the image
   */
  static async render(resource: ImageAtlasResource): Promise<ImageAtlasResource> {
    // Make sure our canvas object is ready for rendering
    await this.awaitContext();

    // Calculate all of the image metrics and ensure the image can be drawn
    this.calculateImageSize(resource, resource.sampleScale, true);

    return resource;
  }

  /**
   * Performs the rendering of the image
   */
  static renderSync(resource: ImageAtlasResource): ImageAtlasResource {
    // Ensure our offscreen canvas is prepped
    this.getContext();

    if (!canvas) {
      console.warn('Can not render a image synchronously without the canvas context being ready.');
      return resource;
    }

    // Calculate all of the image metrics and generate a canvas on the image that can
    // Be rendered to the canvas.
    this.calculateImageSize(resource, resource.sampleScale, true);

    return resource;
  }
}
