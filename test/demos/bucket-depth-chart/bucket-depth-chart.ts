import { InstanceProvider, Vec2, Vec3, Vec4 } from "src";
import { Bar } from "./bar";
import { BlockInstance } from "./block";

export interface IBucketDepthChartOptions {
  bottomCenter?: Vec2;
  chartData: Vec3[][];
  colors: Vec4[];
  maxDepth?: number;
  minDepth?: number;
  width: number;
  viewWidth?: number;
  heightScale?: number;
  resolution?: number;
  provider: InstanceProvider<BlockInstance>;
}

export class BucketDepthChart {
  private _maxDepth: number = 0;
  private _minDepth: number = 0;
  private _bottomCenter: Vec2 = [0, 0];
  private _width: number;
  viewWidth: number;
  private _heightScale: number = 1;
  resolution: number = 100;
  bars: Bar[] = [];
  provider: InstanceProvider<BlockInstance>;

  constructor(options: IBucketDepthChartOptions) {
    this._maxDepth = options.maxDepth || this._maxDepth;
    this._minDepth = options.minDepth || this._minDepth;
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this._width = options.width;
    this.viewWidth = options.viewWidth || options.width;
    this._heightScale = options.heightScale || this._heightScale;
    this.resolution = options.resolution || this.resolution;
    this.provider = options.provider;

    this.generateBars(options.chartData, options.colors);
  }

  get maxDepth() {
    return this._maxDepth;
  }

  set maxDepth(val: number) {
    if (this.bars.length === 0) return;

    if (this.bars.length === 1) {
      this.bars[0].baseZ = (val + this._minDepth) / 2;
    } else {
      const deltaDepth = (val - this.minDepth) / (this.bars.length - 1);

      for (let i = 0, endi = this.bars.length; i < endi; i++) {
        this.bars[i].baseZ = this.minDepth + deltaDepth * i;
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
      this.bars[0].baseZ = (this._maxDepth + val) / 2;
    } else {
      const deltaDepth = (this._maxDepth - val) / (this.bars.length - 1);

      for (let i = 0, endi = this.bars.length; i < endi; i++) {
        this.bars[i].baseZ = val + deltaDepth * i;
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

  generateBars(data: Vec3[][], colors: Vec4[]) {
    if (data.length === 0) return;

    if (data.length === 1) {
      const bar: Bar = new Bar({
        bottomCenter: this.bottomCenter,
        barData: data[0],
        width: this.width,
        heightScale: this.heightScale,
        color: colors[0],
        baseZ: (this.maxDepth + this.minDepth) / 2,
        provider: this.provider,
        viewWidth: this.viewWidth,
        resolution: this.resolution
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
          baseZ: this.minDepth + deltaDepth * i,
          resolution: this.resolution,
          provider: this.provider,
          viewWidth: this.viewWidth
        });

        this.bars.push(bar);
      }
    }
  }

  insertToProvider(provider: InstanceProvider<BlockInstance>) {
    this.bars.forEach(bar => bar.insertToProvider(provider));
  }

  updateByDragX(dragX: number) {
    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      bar.updateByDragX(dragX);
    }
  }

  updateByCameraPosition(pos: Vec3) {
    this.bars.forEach(bar => bar.updateByCameraPosition(pos));
  }
}
