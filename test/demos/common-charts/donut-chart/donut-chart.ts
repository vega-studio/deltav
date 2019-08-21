import { ArcInstance, Vec2 } from "src";
import { Color, getColor, getSum } from "../chart-utility";

export interface IDonutChartOptions {
  center?: Vec2;
  innerRadius?: number;
  outerRadius?: number;
  datas?: number[];
  colors?: Color[];
}

export class DonutChart {
  center: Vec2 = [0, 0];
  innerRadius: number = 60;
  outerRadius: number = 100;
  datas: number[] = [];
  colors: Color[] = [];

  arcs: ArcInstance[] = [];

  constructor(options: IDonutChartOptions) {
    this.center = options.center || this.center;
    this.innerRadius = options.innerRadius || this.innerRadius;
    this.outerRadius = options.outerRadius || this.outerRadius;
    this.datas = options.datas || this.datas;
    this.colors = options.colors || this.colors;

    this.buildChart();
  }

  buildChart() {
    const sum = getSum(this.datas);
    let startAngle = 0;

    const radius = (this.innerRadius + this.outerRadius) / 2;
    const deltaR = (this.outerRadius - this.innerRadius) / 2;

    const gap = this.datas.length > 1 ? 0.02 : 0;

    for (let i = 0, endi = this.datas.length; i < endi; i++) {
      const color = getColor(this.colors[i]);

      const arc = new ArcInstance({
        angle: [
          startAngle + gap / 2,
          startAngle + this.datas[i] * Math.PI * 2 / sum - gap / 2
        ],
        radius,
        colorStart: color,
        colorEnd: color,
        center: this.center,
        thickness: [deltaR, deltaR]
      });

      this.arcs.push(arc);

      startAngle += this.datas[i] * Math.PI * 2 / sum;
    }
  }
}
