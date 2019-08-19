import { add2, CircleInstance, EdgeInstance, Vec2 } from "src";
import { Color, getColor } from "../chart-utility";

export interface IScatterChartOptions {
  origin?: Vec2;
  width?: number;
  height?: number;
  datas?: Vec2[];
  color?: Color;
}

export class ScatterChart {
  origin: Vec2 = [0, 0];
  width: number = 1000;
  height: number = 500;
  radius: number = 5;
  color: Color = [1, 1, 1, 1];
  datas: Vec2[] = [];

  circles: CircleInstance[] = [];
  lines: EdgeInstance[] = [];

  constructor(options: IScatterChartOptions) {
    this.origin = options.origin || this.origin;
    this.width = options.width || this.width;
    this.height = options.height || this.height;
    this.datas = options.datas || this.datas;
    this.color = options.color || this.color;

    this.buildCharts();
  }

  buildCharts() {
    this.lines.push(
      new EdgeInstance({
        start: add2(this.origin, [-this.width / 2, 0]),
        end: add2(this.origin, [this.width / 2, 0])
      })
    );

    this.lines.push(
      new EdgeInstance({
        start: add2(this.origin, [0, this.height / 2]),
        end: add2(this.origin, [0, -this.height / 2])
      })
    );

    this.datas.forEach(data => {
      this.circles.push(
        new CircleInstance({
          radius: this.radius,
          color: getColor(this.color),
          center: add2([data[0], -data[1]], this.origin)
        })
      );
    });
  }
}
