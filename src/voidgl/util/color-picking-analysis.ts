import { IColorPickingData } from '..';
import { Vec2 } from './vector';

const { floor } = Math;

/**
 * This analyzes the rendered data for color picking and outputs the metrics and data needed
 * for the operation.
 */
export function analyzeColorPickingRendering(mouse: Vec2, data: Uint8Array, width: number, height: number) {
  const pickingData: IColorPickingData = {
    allColors: [],
    colorData: data,
    dataHeight: height,
    dataWidth: width,
    mouse,
    nearestColor: 0,
  };

  const uniqueColors = new Map<number, boolean>();
  let pixelIndex = 0;
  const colors: number[][] = [];

  for (let i = 0; i < height; ++i) {
    const row: number[] = [];
    colors.push(row);

    for (let k = 0; k < width; ++k) {
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      const color = r << 16 | g << 8 | b;

      pixelIndex += 4;
      uniqueColors.set(color, true);
      row.push(color);
    }
  }

  // Apply all o fthe unique colors that were discovered within the rendering
  pickingData.allColors = Array.from(uniqueColors.keys());
  // The nearest color will be the element in the middle of the array of colors
  pickingData.nearestColor = colors[floor(width / 2)][floor(height / 2)];

  return pickingData;
}
