import { BlockInstance, InstanceProvider, Vec2, Vec4 } from "src";

export interface IBarOptions {
  // Sets the center point of the bottom line
  bottomCenter?: Vec2;
  // Sets the color
  color?: Vec4;
  // Contains the time and value information of each point in the chart
  // Data should be sorted by time
  // First element's time should be 0 and last elemet's time should be 1
  barData: Vec2[];
  // Depth of the chart, will help to show layers of chart when view angle is changed
  depth?: number;
  // Height scale that will be applied to the value in data array
  heightScale?: number;
  // Sets the width of the chart
  width: number;
}

/** A chart which shows data change over time, the chart will always face to the positive Z direction*/
export class Bar {
  // Center of bottom line of the chart, no depth information in it
  private _bottomCenter: Vec2 = [0, 0];
  // Color of the chart including opacity
  private _color: Vec4 = [1, 1, 1, 1];
  // Depth of the chart
  private _depth: number = 0;
  // Scale that will be applied for the height of each value
  private _heightScale: number = 1;
  /** Instances that will be generated */
  private blockInstances: BlockInstance[] = [];
  /** Width of the chart */
  private _width: number;

  constructor(options: IBarOptions) {
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this._color = options.color || this._color;
    this._depth = options.depth || this._depth;
    this._heightScale = options.heightScale || this._heightScale;
    this._width = options.width;

    this.generateInstances(options.barData);
  }

  get bottomCenter() {
    return this._bottomCenter;
  }

  set bottomCenter(val: Vec2) {
    const oldBottomCenter = this._bottomCenter;

    this.blockInstances.forEach(instance => {
      instance.startValue = [
        instance.startValue[0] + val[0] - oldBottomCenter[0],
        instance.startValue[1],
        instance.startValue[2]
      ];

      instance.endValue = [
        instance.endValue[0] + val[0] - oldBottomCenter[0],
        instance.endValue[1],
        instance.endValue[2]
      ];

      instance.baseLine = val[1];
    });

    this._bottomCenter = val;
  }

  get width() {
    return this._width;
  }

  set width(val: number) {
    const scale = val / this._width;
    const bottomCenter = this.bottomCenter;
    const oldBaseX = bottomCenter[0] - this._width / 2;
    const baseX = bottomCenter[0] - val / 2;

    for (let i = 0, endi = this.blockInstances.length; i < endi; i++) {
      const instance = this.blockInstances[i];
      instance.startValue = [
        baseX + (instance.startValue[0] - oldBaseX) * scale,
        instance.startValue[1],
        instance.startValue[2]
      ];

      instance.endValue = [
        baseX + (instance.endValue[0] - oldBaseX) * scale,
        instance.endValue[1],
        instance.endValue[2]
      ];
    }

    this._width = val;
  }

  get color() {
    return this._color;
  }

  set color(val: Vec4) {
    this.blockInstances.forEach(instance => (instance.color = val));
    this._color = val;
  }

  get depth() {
    return this._depth;
  }

  set depth(val: number) {
    this.blockInstances.forEach(instance => {
      instance.startValue = [
        instance.startValue[0],
        instance.startValue[1],
        val
      ];

      instance.endValue = [instance.endValue[0], instance.endValue[1], val];
    });

    this._depth = val;
  }

  get heightScale() {
    return this._heightScale;
  }

  set heightScale(val: number) {
    const scale = val / this._heightScale;

    this.blockInstances.forEach(instance => {
      instance.startValue = [
        instance.startValue[0],
        instance.startValue[1] * scale,
        instance.startValue[2]
      ];

      instance.endValue = [
        instance.endValue[0],
        instance.endValue[1] * scale,
        instance.endValue[2]
      ];
    });

    this._heightScale = val;
  }

  private generateInstances(data: Vec2[]) {
    if (data.length < 1) {
      console.error(
        "A bucket depth chart needs at least two elements in data array"
      );
    }

    data.sort((a, b) => a[0] - b[0]);

    const width = this.width;
    const heightScale = this.heightScale;
    const bottomCenter = this.bottomCenter;
    const depth = this.depth;
    const color = this.color;

    const baseX = bottomCenter[0] - width / 2;
    const baseY = bottomCenter[1];

    for (let i = 0, endi = data.length; i < endi - 1; i++) {
      const x1 = baseX + data[i][0] * width;
      const x2 = baseX + data[i + 1][0] * width;
      const y1 = data[i][1] * heightScale;
      const y2 = data[i + 1][1] * heightScale;

      const block = new BlockInstance({
        startValue: [x1, y1, depth],
        endValue: [x2, y2, depth],
        baseLine: baseY,
        color
      });

      this.blockInstances.push(block);
    }
  }

  insertToProvider(provider: InstanceProvider<BlockInstance>) {
    this.blockInstances.forEach(instance => provider.add(instance));
  }
}
