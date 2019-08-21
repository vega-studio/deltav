import { ArcInstance, EdgeInstance, Vec2 } from "src";
import { Color, getColor, getSum } from "../chart-utility";
import { FanInstance } from "./fan-shape/fan-instance";

export interface IPieChartOptions {
  center?: Vec2;
  radius?: number;
  datas?: number[];
  colors?: Color[];
}

export class PieChart {
  center: Vec2 = [0, 0];
  radius: number = 200;
  datas: number[] = [];
  colors: Color[] = [];

  arcs: ArcInstance[] = [];
  lines: EdgeInstance[] = [];
  fans: FanInstance[] = [];

  constructor(options: IPieChartOptions) {
    this.center = options.center || this.center;
    this.radius = options.radius || this.radius;
    this.datas = options.datas || this.datas;
    this.colors = options.colors || this.colors;

    this.buildChart();
  }

  buildChart() {
    const sum = getSum(this.datas);
    let startAngle = 0;

    for (let i = 0, endi = this.datas.length; i < endi; i++) {
      const color = getColor(this.colors[i]);

      const fan = new FanInstance({
        angle: [startAngle, startAngle + this.datas[i] * Math.PI * 2 / sum],
        radius: this.radius,
        color,
        center: this.center
      });

      this.fans.push(fan);

      startAngle += this.datas[i] * Math.PI * 2 / sum;
    }
  }
}
