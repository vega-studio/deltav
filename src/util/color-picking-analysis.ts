import { IColorPickingData } from "../types";
import { Vec2, Vec4 } from "./vector";

/**
 * This analyzes the rendered data for color picking and outputs the metrics and data needed
 * for the operation.
 */
export function analyzeColorPickingRendering(
  mouse: Vec2,
  data: Uint8Array,
  width: number,
  height: number
) {
  const pickingData: IColorPickingData = {
    allColors: [],
    colorData: data,
    dataHeight: height,
    dataWidth: width,
    mouse,
    nearestColor: 0,
    nearestColorBytes: [0, 0, 0, 0]
  };

  const uniqueColors = new Map<number, boolean>();
  let pixelIndex = 0;
  const colors: number[][] = [];
  const mouseX: number = width / 2;
  const mouseY: number = height / 2;

  let nearestColor = 0x000000;
  let nearestColorBytes: Vec4 = [0, 0, 0, 0];
  let distance = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < height; ++i) {
    const row: number[] = [];
    colors.push(row);

    for (let k = 0; k < width; ++k) {
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      pixelIndex += 4;

      const color = (r << 16) | (g << 8) | b;
      uniqueColors.set(color, true);
      row.push(color);

      // If the color is not black, let's test the distance against currnet nearest color
      if (color !== 0x000000) {
        const dx = k - mouseX;
        const dy = i - mouseY;
        const testDistance = dx * dx + dy * dy;

        if (testDistance < distance) {
          distance = testDistance;
          nearestColor = color;
          nearestColorBytes = [r, g, b, 255];
        }
      }
    }
  }

  // Apply all o fthe unique colors that were discovered within the rendering
  pickingData.allColors = Array.from(uniqueColors.keys());
  // The nearest color will be the element in the middle of the array of colors
  pickingData.nearestColor = nearestColor;
  // The nearest color in byte components
  pickingData.nearestColorBytes = nearestColorBytes;

  return pickingData;
}
