import { PromiseResolver } from "../../util";

const img = document.createElement("img");
const canvas = document.createElement("canvas");

/**
 * This takes a very simple svg and converts it to a data object for pixel examination.
 */
export async function svgToData(svg: SVGSVGElement) {
  const resolver = new PromiseResolver<ImageData | null>();
  if (!img || !canvas) return null;

  // Get svg data
  const xml = new XMLSerializer().serializeToString(svg);
  // Make it base64
  const svg64 = btoa(xml);
  const b64Start = "data:image/svg+xml;base64,";
  // Prepend the base64 "header"
  const image64 = b64Start + svg64;

  // Method for rendering to the canvas once the svg image is ready
  const draw = () => {
    // Make sure the canvas accommodates your monitor density!
    canvas.width = img.width * window.devicePixelRatio;
    canvas.height = img.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolver.resolve(null);
      return;
    }

    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      img,
      0,
      0,
      img.width * window.devicePixelRatio,
      img.height * window.devicePixelRatio
    );

    resolver.resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));

    // Clean up used RAM useage for the image and canvas context
    img.src = "";
    canvas.width = 0;
    canvas.height = 0;
  };

  img.onload = draw;
  img.src = image64;

  // If the width is already set then the image already has rendered it's contents and is ready to render to the
  // canvas context.
  if (img.width > 0 && img.height > 0) {
    draw();
  }

  const result = await resolver.promise;
  return result;
}
