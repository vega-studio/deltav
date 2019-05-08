import { Bounds, Vec2 } from "src";

const { min, max } = Math;

export function textPositions(
  bounds: Bounds<never>,
  text: string,
  fontSize: number = 40
) {
  const canvas = document.createElement("canvas").getContext("2d");
  if (!canvas) return [];

  let width = (canvas.canvas.width = bounds.width - 10);
  let height = (canvas.canvas.height = fontSize * 2);
  canvas.fillStyle = "white";
  canvas.font = `${fontSize}px Consolas`;
  canvas.fillText(text, 0, fontSize, bounds.width - 10);

  const pixels = canvas.getImageData(0, 0, width, height);

  const imageData = pixels.data;
  width = pixels.width;
  height = pixels.height;

  let r, g, b, a;
  let minY = Number.MAX_SAFE_INTEGER;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  const xyBucket: Vec2[] = [];

  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      const red = y * (width * 4) + x * 4;

      r = imageData[red];
      g = imageData[red + 1];
      b = imageData[red + 2];
      a = imageData[red + 3];

      if (r > 0 || g > 0 || b > 0 || a > 0) {
        minY = min(minY, y);
        minX = min(minX, x);
        maxX = max(maxX, x);
        maxY = max(maxY, y);
        xyBucket.push([x, y]);
      }
    }
  }

  const textWidth = maxX - minX;
  const textHeight = maxY - minY;
  const left = Math.floor((bounds.width - textWidth) / 2);
  const top = Math.floor((bounds.height - textHeight) / 2);

  xyBucket.forEach((xy: Vec2) => {
    xy[0] -= minX;
    xy[1] -= minY;
    xy[0] += left;
    xy[1] += top;
  });

  return xyBucket;
}
