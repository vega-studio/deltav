import { FIRFilter } from "@diniden/signal-processing";
import { InstanceProvider, Vec2, Vec3, Vec4 } from "src";
import { Bar } from "./bar";
import { BlockInstance } from "./block";
import { PlateEndInstance } from "./plateEnd";

export interface IBucketDepthChartOptions {
  bottomCenter?: Vec2;
  chartData: Vec3[][];
  colors: Vec4[];
  baseDepth?: number;
  startTime: number;
  unitWidth: number;
  viewWidth?: number;
  viewPortNear?: number;
  viewPortFar?: number;
  padding?: number;
  heightScale?: number;
  providers: InstanceProvider<BlockInstance>[];
  endProviders: InstanceProvider<PlateEndInstance>[];
  heightFilter: FIRFilter;
  depthFilter: FIRFilter;
}

export class BucketDepthChart {
  private _baseDepth: number = 0;
  private _middleDepth: number = 0;
  private _minDepth: number = 0;
  private _maxDepth: number = 0;
  private _bottomCenter: Vec2 = [0, 0];
  startTime: number;
  _dragX: number = 0;
  _dragZ: number = 0;
  _scaleX: number = 1;
  unitWidth: number = 10;
  viewWidth: number = 10;
  _viewPortNear: number = Number.MIN_SAFE_INTEGER;
  _viewPortFar: number = Number.MAX_SAFE_INTEGER;
  private _heightScale: number = 1;
  private _padding: number = 0;
  groupSize: number = 1;
  bars: Bar[] = [];
  providers: InstanceProvider<BlockInstance>[];
  endProviders: InstanceProvider<PlateEndInstance>[];
  heightFilter: FIRFilter = new FIRFilter([]);
  depthFilter: FIRFilter = new FIRFilter([]);

  constructor(options: IBucketDepthChartOptions) {
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this.startTime = options.startTime;
    this.unitWidth = options.unitWidth || this.unitWidth;
    this.viewWidth = options.viewWidth || this.viewWidth;
    this._viewPortNear = options.viewPortNear || this._viewPortNear;
    this._viewPortFar = options.viewPortFar || this._viewPortFar;
    this._padding = options.padding || this._padding;
    this._heightScale = options.heightScale || this._heightScale;
    this.providers = options.providers;
    this.endProviders = options.endProviders;
    this._baseDepth = options.baseDepth || this._baseDepth;
    this._middleDepth = this._baseDepth;
    this.heightFilter = options.heightFilter || this.heightFilter;
    this.depthFilter = options.depthFilter || this.depthFilter;

    this.generateBars(options.chartData, options.colors);
  }

  get maxDepth() {
    return this._maxDepth;
  }

  get minDepth() {
    return this._minDepth;
  }

  get viewPortNear() {
    return this._viewPortNear;
  }
  set viewPortNear(val: number) {
    this._viewPortNear = val;
    this.bars.forEach(bar => (bar.viewPortNear = val));
  }

  get viewPortFar() {
    return this._viewPortFar;
  }
  set viewPortFar(val: number) {
    this._viewPortFar = val;
    this.bars.forEach(bar => (bar.viewPortFar = val));
  }

  get padding() {
    return this._padding;
  }

  set padding(val: number) {
    const delta = val - this.padding;
    this._padding = val;
    this._minDepth -= (this.bars.length - 1) * delta;
    let preDepth = 0;
    let curBaseZ = this._minDepth;

    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      const curDepth = bar.maxDepth;
      // update base Z
      curBaseZ += preDepth / 2 + (i > 0 ? this._padding : 0) + curDepth / 2;
      bar.baseZ = curBaseZ;
      preDepth = curDepth;
    }

    // Update center
    this.middleDepth = (this._maxDepth + this._minDepth) / 2;
  }

  get middleDepth() {
    return this._middleDepth;
  }

  set middleDepth(val: number) {
    this._middleDepth = val;
  }

  get width() {
    let maxWidth = 0;

    this.bars.forEach(bar => {
      maxWidth = Math.max(maxWidth, bar.width);
    });

    return maxWidth;
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

  get maxTime() {
    let max_time = 0;
    this.bars.forEach(bar => {
      max_time = Math.max(max_time, bar.maxTime);
    });
    return max_time;
  }

  get minTime() {
    let min_time = Number.MAX_SAFE_INTEGER;
    this.bars.forEach(bar => {
      min_time = Math.min(min_time, bar.minTime);
    });
    return min_time;
  }

  generateBars(data: Vec3[][], colors: Vec4[]) {
    if (data.length === 0) return;

    if (data.length === 1) {
      let curDepth = 0;
      data[0].forEach(d => (curDepth = Math.max(curDepth, d[2])));
      this._minDepth = this._baseDepth - curDepth / 2;
      this._maxDepth = this._baseDepth + curDepth / 2;

      const bar: Bar = new Bar({
        bottomCenter: this.bottomCenter,
        barData: data[0],
        startTime: this.startTime,
        unitWidth: this.unitWidth,
        heightScale: this.heightScale,
        color: colors[0],
        baseZ: this._baseDepth,
        provider: this.providers[0],
        endProvider: this.endProviders[0],
        viewWidth: this.viewWidth,
        viewPortFar: this.viewPortFar,
        viewPortNear: this.viewPortNear,
        heightFilter: this.heightFilter,
        depthFilter: this.depthFilter
      });

      this.bars.push(bar);
    } else {
      const depths = [];
      this._minDepth = this._baseDepth;

      for (let i = 0, endi = data.length; i < endi; i++) {
        let curDepth = 0;
        data[i].forEach(d => (curDepth = Math.max(curDepth, d[2])));
        depths.push(curDepth);

        this._minDepth -= (i > 0 ? this.padding : 0) + curDepth;

        if (i === data.length - 1) {
          this._maxDepth = this._baseDepth + curDepth / 2;
          this._minDepth += curDepth / 2;
        }
      }

      let baseZ = this._minDepth;
      let preDepth = 0;

      for (let i = 0; i < depths.length; i++) {
        const curDepth = depths[i];
        baseZ += curDepth / 2 + (i > 0 ? this.padding : 0) + preDepth / 2;
        preDepth = curDepth;

        const bar: Bar = new Bar({
          bottomCenter: this.bottomCenter,
          barData: data[i],
          startTime: this.startTime,
          unitWidth: this.unitWidth,
          heightScale: this.heightScale,
          color: colors[i],
          baseZ,
          provider: this.providers[i],
          endProvider: this.endProviders[i],
          viewWidth: this.viewWidth,
          viewPortFar: this.viewPortFar,
          viewPortNear: this.viewPortNear,
          maxDepth: curDepth,
          heightFilter: this.heightFilter,
          depthFilter: this.depthFilter
        });

        this.bars.push(bar);
      }
    }
    this._middleDepth = (this._minDepth + this._maxDepth) / 2;
  }

  updateByDragX(dragX: number) {
    this._dragX = dragX;
    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      bar.updateByDragX(dragX);
    }
  }

  updateByScaleX(scaleX: number, dragX: number, groupSize?: number) {
    this._scaleX = scaleX;
    this._dragX = dragX;
    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      bar.updateByScaleX(scaleX, dragX, groupSize);
    }
  }

  updateByDragZ(dragZ: number) {
    this._dragZ = dragZ;
    for (let i = 0, endi = this.bars.length; i < endi; i++) {
      const bar = this.bars[i];
      bar.updateByDragZ(dragZ);
    }
  }

  addBar(data: Vec3[], color: Vec4, index: number) {
    let preDepth = 0;

    if (this.bars.length > 0) {
      const len = this.bars.length;
      preDepth = this.bars[len - 1].maxDepth;
    }

    let curDepth = 0;
    data.forEach(d => (curDepth = Math.max(curDepth, d[2])));
    const delta = curDepth / 2 + this.padding + preDepth / 2;

    // Move pre bars
    this.bars.forEach(bar => {
      bar.baseZ = bar.baseZ - delta;
    });

    // Add the new bar
    this._maxDepth = this._baseDepth + curDepth / 2;

    const bar: Bar = new Bar({
      bottomCenter: this.bottomCenter,
      barData: data,
      startTime: this.startTime,
      unitWidth: this.unitWidth,
      heightScale: this.heightScale,
      color,
      baseZ: this._baseDepth,
      provider: this.providers[index],
      endProvider: this.endProviders[index],
      viewWidth: this.viewWidth,
      viewPortFar: this.viewPortFar,
      viewPortNear: this.viewPortNear,
      maxDepth: curDepth,
      heightFilter: this.heightFilter,
      depthFilter: this.depthFilter
    });

    this.bars.push(bar);

    bar.updateByScaleX(this._scaleX, this._dragX, this.groupSize);
    bar.updateByDragZ(this._dragZ);

    this._minDepth = this._minDepth - delta;
    this._middleDepth = (this._minDepth + this._maxDepth) / 2;
  }

  reduceBar() {
    const bar = this.bars.pop();

    if (bar) {
      const curDepth = bar.maxDepth;
      let preDepth = 0;

      if (this.bars.length > 0) {
        const len = this.bars.length;
        preDepth = this.bars[len - 1].maxDepth;
      }

      // Update minDepth
      const delta = (curDepth + preDepth) / 2 + this.padding;
      this._minDepth += delta;

      // Update maxDepth
      this._maxDepth = this._baseDepth + preDepth / 2;

      // Update bars
      this.bars.forEach(bar => (bar.baseZ = bar.baseZ + delta));

      // Update middleDepth
      this._middleDepth = (this._minDepth + this._maxDepth) / 2;

      bar.clearAllInstances();
    }
  }
}
