import {
  add2,
  EdgeInstance,
  LabelInstance,
  RectangleInstance,
  Vec2,
  Vec4
} from "src";

type Color = Vec4 | string;

export interface IBarChartOptions {
  origin?: Vec2;
  width?: number;
  height?: number;
  barNames?: string[];
  datas?: number[];
  colors?: Color[];
}

export class BarChart {
  origin: Vec2 = [0, 0];
  width: number = 1000;
  height: number = 500;
  barNames: string[] = [];
  datas: number[] = [];
  colors: Color[] = [];

  rectangles: RectangleInstance[] = [];
  lines: EdgeInstance[] = [];
  labels: LabelInstance[] = [];

  constructor(options: IBarChartOptions) {
    this.origin = options.origin || this.origin;
    this.width = options.width || this.width;
    this.height = options.height || this.height;
    this.barNames = options.barNames || this.barNames;
    this.datas = options.datas || this.datas;
    this.colors = options.colors || this.colors;

    this.buildChart();
  }

  buildChart() {
    this.lines.push(
      new EdgeInstance({
        start: this.origin,
        end: add2(this.origin, [this.width, 0])
      })
    );

    this.lines.push(
      new EdgeInstance({
        start: this.origin,
        end: add2(this.origin, [0, this.height])
      })
    );

    if (this.datas.length === 0) return;

    const barWidth = this.width / this.datas.length;

    for (let i = 0, endi = this.datas.length; i < endi; i++) {
      this.rectangles.push(
        new RectangleInstance({
          color: [1, 1, 1, 1],
          depth: 0,
          position: add2(this.origin, [barWidth * i + barWidth / 2, 0]),
          size: [barWidth * 0.5, this.datas[i] * 5]
        })
      );
    }
  }
}
