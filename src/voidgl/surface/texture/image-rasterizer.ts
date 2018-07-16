import { ImageAtlasResource } from './image-atlas-resource';

let canvas: CanvasRenderingContext2D | null;

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
      await new Promise(resolve => setTimeout(resolve, 10));
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
  static calculateImageSize(
    resource: ImageAtlasResource,
    sampleScale?: number,
  ) {
    /** Get the image properties for rasterizing */
    const image = resource.image.element;

    if (!image) {
      console.warn(
        'Image does not exist! Please ensure the resource contains a valid image.',
      );
      return;
    }

    if (!canvas) {
      console.warn(
        'The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first.',
      );
      return;
    }

    if (image.width === 0 || image.height === 0) {
      console.warn(
        'Images provided shoud have valid dimensions! Please ensure the image is loaded first.',
      );
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
      texture: { height: 0, width: 0 },
      world: { height: 0, width: 0 },
    };

    // Update the calculated texture size.
    resource.rasterization.texture = {
      height: image.height * resource.sampleScale,
      width: image.width * resource.sampleScale,
    };

    resource.rasterization.world = {
      height: image.height,
      width: image.width,
    };

    resource.rasterization.image = image;
  }

  /**
   * Performs the rendering of the image
   */
  static async render(
    resource: ImageAtlasResource,
  ): Promise<ImageAtlasResource> {
    // Make sure our canvas object is ready for rendering
    await this.awaitContext();

    // Calculate all of the image metrics and ensure the image can be drawn
    this.calculateImageSize(resource, resource.sampleScale);

    return resource;
  }

  /**
   * Performs the rendering of the image
   */
  static renderSync(resource: ImageAtlasResource): ImageAtlasResource {
    // Ensure our offscreen canvas is prepped
    this.getContext();

    if (!canvas) {
      console.warn(
        'Can not render a image synchronously without the canvas context being ready.',
      );
      return resource;
    }

    // Calculate all of the image metrics and generate a canvas on the image that can
    // Be rendered to the canvas.
    this.calculateImageSize(resource, resource.sampleScale);

    return resource;
  }
}
