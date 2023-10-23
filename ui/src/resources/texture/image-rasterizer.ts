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
      canvas = document.createElement("canvas").getContext("2d");
    }
  }

  /**
   * This ensures an image is renderable at the current moment. This draws the
   * image to a canvas partially to help the image 'warm up' within some browser
   * contexts to ensure the image can be used as a drawable item.
   */
  static async calculateImageSize(image: HTMLImageElement) {
    await this.awaitContext();

    if (!canvas) {
      console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      );
      return;
    }

    if (image.width === 0 || image.height === 0) {
      console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      );
      return;
    }

    // Just make sure th canvas is available
    canvas.canvas.width = 100;
    canvas.canvas.height = 100;
    // Render the image into our canvas merely to ensure the image can be
    // rendered This action often 'warms up' images such as images that have a
    // data URL instead of a path
    canvas.drawImage(image, 0, 0, 1, 1);

    return [image.width, image.height];
  }

  /**
   * This resizes the input image by the provided scale.
   */
  static async resizeImage(image: TexImageSource, scale: number) {
    await this.awaitContext();

    if (!canvas) {
      console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      );

      return image;
    }

    if (image.width === 0 || image.height === 0) {
      console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      );

      return image;
    }

    // Make the canvas the proper size to render the resized image
    canvas.canvas.width = Math.floor(image.width * scale);
    canvas.canvas.height = Math.floor(image.height * scale);

    // Render the image into our canvas with the resizing taking place
    if (image instanceof ImageData) {
      canvas.putImageData(
        image,
        0,
        0,
        0,
        0,
        canvas.canvas.width,
        canvas.canvas.height
      );
    } else {
      canvas.drawImage(image, 0, 0, canvas.canvas.width, canvas.canvas.height);
    }

    // Make our canvas a data url for another image to become
    const out = new Image();
    out.src = canvas.canvas.toDataURL("image/png");
    // Ensure the image is renderable at this moment
    await ImageRasterizer.calculateImageSize(out);

    return out;
  }
}
