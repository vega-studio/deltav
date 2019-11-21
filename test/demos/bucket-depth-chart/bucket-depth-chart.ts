import { InstanceProvider, Vec2, Vec3, Vec4 } from "src";
import { Bar } from "./bar";
import { BlockInstance } from "./block";
import { PlateEndInstance } from "./plateEnd";

export interface IBucketDepthChartOptions {
  bottomCenter?: Vec2;
  chartData: Vec3[][];
  colors: Vec4[];
  baseDepth?: number;
  width: number;
  viewWidth?: number;
  padding?: number;
  heightScale?: number;
  resolution?: number;
  providers: InstanceProvider<BlockInstance>[];
  endProviders: InstanceProvider<PlateEndInstance>[];
}

export class BucketDepthChart {
  private _baseDepth: number = 0;
  private _middleDepth: number = 0;
  private _bottomCenter: Vec2 = [0, 0];
  private _width: number;
  viewWidth: number;
  private _heightScale: number = 1;
  private _padding: number = 0;
  resolution: number = 100;
  bars: Bar[] = [];
  providers: InstanceProvider<BlockInstance>[];
  endProviders: InstanceProvider<PlateEndInstance>[];

  constructor(options: IBucketDepthChartOptions) {
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this._width = options.width;
    this.viewWidth = options.viewWidth || options.width;
    this._padding = options.padding || this._padding;
    this._heightScale = options.heightScale || this._heightScale;
    this.resolution = options.resolution || this.resolution;
    this.providers = options.providers;
    this.endProviders = options.endProviders;
    this._baseDepth = options.baseDepth || this._baseDepth;
    this._middleDepth = this._baseDepth;

    this.generateBars(options.chartData, options.colors);
  }

  /*get maxDepth() {
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
  }*/

  get padding() {
    return this._padding;
  }

  set padding(val: number) {
    const delta = val - this.padding;
    this._padding = val;

    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];

      // update base Z
      bar.baseZ = bar.baseZ + delta * i;
    }

    // Update center
    this.middleDepth += (this.bars.length - 1) * delta / 2;
  }

  get middleDepth() {
    return this._middleDepth;
  }

  set middleDepth(val: number) {
    this._middleDepth = val;
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
        baseZ: this._baseDepth,
        provider: this.providers[0],
        endProvider: this.endProviders[0],
        viewWidth: this.viewWidth,
        resolution: this.resolution
      });

      this.bars.push(bar);
    } else {
      let preDepth = 0;
      let baseZ = this._baseDepth;
      let minDepth = baseZ;
      let maxDepth = baseZ;

      for (let i = 0, endi = data.length; i < endi; i++) {
        let curDepth = 0;
        data[i].forEach(d => (curDepth = Math.max(curDepth, d[2])));
        if (i === 0) minDepth = baseZ - curDepth / 2;
        if (i > 0) baseZ += preDepth / 2 + this._padding + curDepth / 2;
        maxDepth = baseZ + curDepth / 2;

        const bar: Bar = new Bar({
          bottomCenter: this.bottomCenter,
          barData: data[i],
          width: this.width,
          heightScale: this.heightScale,
          color: colors[i],
          baseZ,
          resolution: this.resolution,
          provider: this.providers[i],
          endProvider: this.endProviders[i],
          viewWidth: this.viewWidth
        });

        this.bars.push(bar);
        preDepth = curDepth;
      }

      this._middleDepth = (minDepth + maxDepth) / 2;
    }
  }

  updateByDragX(dragX: number) {
    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      bar.updateByDragX2(dragX);
    }
  }

  updateByCameraPosition(pos: Vec3) {
    this.bars.forEach(bar => bar.updateByCameraPosition(pos));
  }
}
