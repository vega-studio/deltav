import { PromiseResolver } from "../../util";
import type { IFontMapMetrics } from "./font-manager.js";

const img = document.createElement("img");
const canvas = document.createElement("canvas");

function embedFontString(
  fontName: string,
  source: string,
  weight: number | `${number} ${number}` = 400,
  style = "normal",
  fontType = "woff2"
) {
  return `
    @font-face {
      font-family: '${fontName}';
      src: url('${source}') ${fontType ? `format('${fontType}')` : ""};
      font-weight: ${weight};
      font-style: ${style};
    }
  `;
}

/**
 * This takes a very simple svg and converts it to a data object for pixel
 * examination.
 *
 * Note: if a font is NOT a system font, it needs to be embedded into the svg.
 * To have this method perform this for you use the svgNS AND embed arguments to
 * enable automatic embedding of the font.
 */
export async function svgToData(
  svg: SVGSVGElement,
  svgNS?: string,
  embed?: IFontMapMetrics["embed"]
) {
  const resolver = new PromiseResolver<ImageData | null>();
  if (!img || !canvas) return null;

  // If embeddings are provided, we need to generate a style tag with all of the
  // embeddings injected.
  if (embed && svgNS) {
    const style = document.createElementNS(svgNS, "style");
    style.textContent = embed
      .map((e) =>
        embedFontString(e.familyName, e.source, e.weight, e.style, e.fontType)
      )
      .join("\n");
    svg.prepend(style);
  }

  // Get svg data
  const xml = new XMLSerializer().serializeToString(svg);
  // Make it base64
  const svg64 = btoa(xml);
  const b64Start = "data:image/svg+xml;base64,";
  // Prepend the base64 "header"
  const image64 = b64Start + svg64;
  let didDraw = false;

  // Method for rendering to the canvas once the svg image is ready
  const draw = async () => {
    // Ensure we only draw once
    if (didDraw) return;
    didDraw = true;
    // Make sure the canvas accommodates your monitor density!
    canvas.width = img.width * window.devicePixelRatio;
    canvas.height = img.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      resolver.resolve(null);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    // img.src = "";
    // To debug this, simply uncomment this line and comment out the width/height change
    // document.body.appendChild(canvas);
    // canvas.width = 0;
    // canvas.height = 0;
    canvas.style.position = "absolute";
    canvas.style.top = "100px";
    canvas.style.left = "0px";
    canvas.style.zIndex = "9999";
    canvas.id = "svg-to-data";
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
