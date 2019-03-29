/**
 * This provides the methods needed to render single glyphs and receive the image data
 * for the rendering. The glyphs will be rendered within a given dimension range and centered.
 */

const { min, max } = Math;
const canvas = document.createElement("canvas");
let ctx: CanvasRenderingContext2D;

/**
 * Measures the contents of a canvas based on the canvas havinga pure black
 * background with rendered elements as white.
 */
function measureBlackWhiteCanvasContents(canvas: CanvasRenderingContext2D) {
  const { width, height } = canvas.canvas;
  const imageData = canvas.getImageData(0, 0, width, height).data;
  let r;

  let found = false;
  let minY = Number.MAX_SAFE_INTEGER;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  for (let i = 0; i < width; ++i) {
    for (let k = 0; k < height; ++k) {
      const redIndex = k * (width * 4) + i * 4;
      r = imageData[redIndex];

      if (r > 0.0) {
        found = true;
        minY = min(minY, k);
        minX = min(minX, i);
        maxX = max(maxX, i);
        maxY = max(maxY, k);
      }
    }
  }

  if (!found) {
    return null;
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
 * Renders a glyph centered within the provided rectangle size. This also provides the size of the
 * rendered glyph along with a vector pointing to the topleft of the glyph within then rectangle.
 * This vector can be used to find any corner of the glyph as the glyph is centered within the
 * rectangle's space.
 */
export function renderGlyph(
  glyph: string,
  width: number,
  height: number,
  font: string
) {
  // Ensure we're rendering a single characters
  glyph = glyph[0];

  if (canvas.width < width || canvas.height < height) {
    canvas.width = width;
    canvas.height = height;
  }

  if (!ctx) {
    const context = canvas.getContext("2d");
    if (context) ctx = context;
    else return null;
  }

  // Draw the glyph
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = font;
  ctx.fillStyle = "white";
  ctx.fillText(glyph, width / 2, height / 2);

  // Get the metrics of the glyph within the rendering
  const dimensions = measureBlackWhiteCanvasContents(ctx);

  if (!dimensions) {
    const data = ctx.getImageData(0, 0, 1, 1);

    return {
      data,
      size: [0, 0]
    };
  }

  // Copy the data from the rendering
  const glyphWidth = dimensions.maxX - dimensions.minX;
  const glyphHeight = dimensions.maxY - dimensions.minY;

  const data = ctx.getImageData(
    dimensions.minX,
    dimensions.minY,
    glyphWidth,
    glyphHeight
  );

  return {
    data,
    size: [glyphWidth, glyphHeight]
  };
}
