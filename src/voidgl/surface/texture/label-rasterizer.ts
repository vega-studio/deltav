import { Label } from '../../primitives/label';

let canvas: CanvasRenderingContext2D;

export interface ILabelRasterizedMetrics {
  canvas: HTMLCanvasElement;
  height: number;
  width: number;
}

export class LabelRasterizer {
  static makeCSSFont(label: Label) {

  }

  static async render(label: Label): Promise<ILabelRasterizedMetrics> {
    // Iterate till the browser provides a valid canvas to render elements into
    while (!canvas) {
      canvas = document.createElement('canvas').getContext('2d');
      await new Promise((resolve) => setTimeout(resolve, 10));
      canvas.height = 150;
    }

    return {};
  }
}
