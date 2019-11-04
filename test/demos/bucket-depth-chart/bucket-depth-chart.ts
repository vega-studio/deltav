import { BlockInstance, InstanceProvider, Vec2, Vec4 } from "src";
import { Bar } from "./bar";

export interface IBucketDepthChartOptions {
  bottomCenter?: Vec2;
  chartData: Vec2[][];
  colors: Vec4[];
  maxDepth?: number;
  minDepth?: number;
  width: number;
  heightScale?: number;
}

export class BucketDepthChart {
  private _maxDepth: number = 0;
  private _minDepth: number = 0;
  private _bottomCenter: Vec2 = [0, 0];
  private _width: number;
  private _heightScale: number = 1;
  bars: Bar[] = [];

  constructor(options: IBucketDepthChartOptions) {
    this._maxDepth = options.maxDepth || this._maxDepth;
    this._minDepth = options.minDepth || this._minDepth;
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this._width = options.width;
    this._heightScale = options.heightScale || this._heightScale;

    this.generateBars(options.chartData, options.colors);
  }

  get maxDepth() {
    return this._maxDepth;
  }

  set maxDepth(val: number) {
    if (this.bars.length === 0) return;

    if (this.bars.length === 1) {
      this.bars[0].depth = (val + this._minDepth) / 2;
    } else {
      const deltaDepth = (val - this.minDepth) / (this.bars.length - 1);

      for (let i = 0, endi = this.bars.length; i < endi; i++) {
        this.bars[i].depth = this.minDepth + deltaDepth * i;
      }
    }

    this._maxDepth = val;
  }

  get minDepth() {
    return this._minDepth;
  }

  set minDepth(val: number) {
    if (this.bars.length === 0) return;

    if (this.bars.length === 1) {
      this.bars[0].depth = (this._maxDepth + val) / 2;
    } else {
      const deltaDepth = (this._maxDepth - val) / (this.bars.length - 1);

      for (let i = 0, endi = this.bars.length; i < endi; i++) {
        this.bars[i].depth = val + deltaDepth * i;
      }
    }

    this._minDepth = val;
  }

  get width() {
    return this._width;
  }

  set width(val: number) {
    this.bars.forEach(bar => (bar.width = val));

    this._width = val;
  }

  get heightScale() {
    return this._heightScale;
  }

  set heightScale(val: number) {
    this.bars.forEach(bar => (bar.heightScale = val));

    this._heightScale = val;
  }

  get bottomCenter() {
    return this._bottomCenter;
  }

  set bottomCenter(val: Vec2) {
    this.bars.forEach(bar => (bar.bottomCenter = val));

    this._bottomCenter = val;
  }

  generateBars(data: Vec2[][], colors: Vec4[]) {
    if (data.length === 0) return;

    if (data.length === 1) {
      const bar: Bar = new Bar({
        bottomCenter: this.bottomCenter,
        barData: data[0],
        width: this.width,
        heightScale: this.heightScale,
        color: colors[0],
        depth: (this.maxDepth + this.minDepth) / 2
      });

      this.bars.push(bar);
    } else {
      const deltaDepth = (this.maxDepth - this.minDepth) / (data.length - 1);

      for (let i = 0, endi = data.length; i < endi; i++) {
        const bar: Bar = new Bar({
          bottomCenter: this.bottomCenter,
          barData: data[i],
          width: this.width,
          heightScale: this.heightScale,
          color: colors[i],
          depth: this.minDepth + deltaDepth * i
        });

        this.bars.push(bar);
      }
    }
  }

  insertToProvider(provider: InstanceProvider<BlockInstance>) {
    this.bars.forEach(bar => bar.insertToProvider(provider));
  }
}
