import { Bounds, Vec2, Vec4 } from "../../../src";

const { min, max } = Math;

export type ImagePosition = [Vec2, Vec4];

export async function imagePositions(bounds: Bounds<any>, image: string) {
  const img = new Image();
  img.src = image;
  const canvas = document.createElement("canvas").getContext("2d");
  if (!canvas) return [];

  let resolver: Function;
  const promise = new Promise(resolve => (resolver = resolve));
  img.onload = () => {
    resolver();
  };

  if (!img.width || !img.height) {
    await promise;
  }

  let width = (canvas.canvas.width = bounds.width - 10);
  canvas.drawImage(img, 0, 0);
  let height = (canvas.canvas.height = img.height * 2);
  canvas.fillStyle = "rgba(0, 0, 0, 0)";
  canvas.fillRect(0, 0, width, height);
  canvas.drawImage(img, (width - img.width) / 2, (height - img.height) / 2);

  const pixels = canvas.getImageData(0, 0, width, height);

  const imageData = pixels.data;
  width = pixels.width;
  height = pixels.height;

  let r, g, b, a;
  let minY = Number.MAX_SAFE_INTEGER;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  const xyBucket: ImagePosition[] = [];

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
        xyBucket.push([[x, y], [r / 255, g / 255, b / 255, a / 255]]);
      }
    }
  }

  const textWidth = maxX - minX;
  const textHeight = maxY - minY;
  const left = Math.floor((bounds.width - textWidth) / 2);
  const top = Math.floor((bounds.height - textHeight) / 2);

  xyBucket.forEach((xy: ImagePosition) => {
    const pos = xy[0];
    pos[0] -= minX;
    pos[1] -= minY;
    pos[0] += left;
    pos[1] += top;
  });

  return xyBucket;
}
