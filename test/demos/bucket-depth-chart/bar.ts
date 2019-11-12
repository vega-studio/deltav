import { BlockInstance, InstanceProvider, Vec2, Vec3, Vec4 } from "src";
import { Bucket } from "./bucket";
import { Interval } from "./interval";

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
  // Sets the number of data groups to form the bar
  resolution?: number;

  provider: InstanceProvider<BlockInstance>;
}

function generateBuckets(data: Vec2[], segments: number): Bucket[] {
  const num = data.length;
  const base = Math.floor(num / segments);
  const extra = num - base * segments;

  const groups = [];

  for (let i = 0; i < segments; i++) {
    groups.push(i < extra ? base + 1 : base);
  }

  const nodes: Vec2[] = [];
  const bucketDatas: Vec2[][] = [];
  let index = 0;

  for (let i = 0; i < groups.length; i++) {
    // Get average time and max value in each group
    let time = 0;
    let value = data[index][1];
    const groupDatas = [];

    for (let j = 0; j < groups[i]; j++) {
      time += data[index][0];
      value = Math.max(value, data[index][1]);
      groupDatas.push(data[index]);
      index++;
    }

    time /= groups[i];

    nodes.push([time, value]);
    bucketDatas.push(groupDatas);
  }

  const minTime = nodes[0][0];
  const maxTime = nodes[nodes.length - 1][0];
  const delta = maxTime - minTime;
  // Adjust time
  for (let i = 0; i < nodes.length; i++) {
    nodes[i][0] = (nodes[i][0] - minTime) / delta;
  }

  // Generate buckets
  const buckets = [];

  for (let i = 0; i < nodes.length; i++) {
    const bucket = new Bucket({
      time: nodes[i][0],
      value: nodes[i][1],
      data: bucketDatas[i]
    });

    buckets.push(bucket);
  }

  return buckets;
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
  /**Number of data groups that make up each line*/
  private _resolution: number;
  private segments: number;

  provider: InstanceProvider<BlockInstance>;

  data: Vec2[];
  buckets: Bucket[];
  intervals: Interval[] = [];

  constructor(options: IBarOptions) {
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this._color = options.color || this._color;
    this._depth = options.depth || this._depth;
    this._heightScale = options.heightScale || this._heightScale;
    this._width = options.width;
    this.provider = options.provider;
    this.data = options.barData;
    this.data.sort((a, b) => a[0] - b[0]);

    if (options.resolution) {
      this._resolution = options.resolution;
      if (options.resolution > options.barData.length) {
        this.segments = options.barData.length;
      } else {
        this.segments = options.resolution;
      }
    } else {
      this._resolution = options.barData.length;
      this.segments = options.barData.length;
    }

    this.generateInstances(options.barData);
  }

  get resolution() {
    return this._resolution;
  }

  set resolution(val: number) {
    if (val !== this._resolution) {
      this._resolution = val;

      const oldSegments = this.segments;

      if (val > this.data.length) {
        this.segments = this.data.length;
      } else if (val < 2) {
        this.segments = 2;
      } else {
        this.segments = val;
      }

      if (this.segments !== oldSegments) {
        this.clearAllInstances();
        this.generateInstances(this.data);
        this.insertToProvider(this.provider);
      }
    }
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

  addData(d: Vec2) {
    const endi = this.data.length;

    for (let i = 0; i < endi; i++) {
      if (d[0] < this.data[i][0]) {
        this.data.splice(i, 0, d);
        break;
      }
    }

    if (d[0] >= this.data[endi - 1][0]) this.data.push(d);

    if (this.resolution > this.data.length) {
      this.segments = this.data.length;
    } else if (this.resolution < 2) {
      this.segments = 2;
    } else {
      this.segments = this.resolution;
    }

    this.reDraw();
  }

  reDraw() {
    this.clearAllInstances();

    this.generateInstances(this.data);

    this.insertToProvider(this.provider);
  }

  clearAllInstances() {
    this.blockInstances.forEach(instance => this.provider.remove(instance));

    this.blockInstances = [];

    this.buckets = [];

    this.intervals = [];
  }

  private generateInstances(data: Vec2[]) {
    if (data.length <= 1) {
      console.error(
        "A bucket depth chart needs at least two elements in data array"
      );
    }

    this.buckets = generateBuckets(data, this.segments);
    const width = this.width;
    const heightScale = this.heightScale;
    const bottomCenter = this.bottomCenter;
    const depth = this.depth;
    const color = this.color;

    const baseX = bottomCenter[0] - width / 2;
    const baseY = bottomCenter[1];

    for (let i = 0, endi = this.buckets.length; i < endi - 1; i++) {
      const bucket = this.buckets[i];
      const nextBucket = this.buckets[i + 1];

      const x1 = baseX + bucket.time * width;
      const x2 = baseX + nextBucket.time * width;
      const y1 = bucket.value * heightScale;
      const y2 = nextBucket.value * heightScale;

      const interval = new Interval({
        leftX: bucket.time * width,
        rightX: nextBucket.time * width,
        leftY: y1,
        rightY: y2
      });

      const block = new BlockInstance({
        startValue: [x1, y1, depth],
        endValue: [x2, y2, depth],
        baseLine: baseY,
        color
      });

      this.blockInstances.push(block);
      interval.addInstance(block);
      this.intervals.push(interval);
    }
  }

  insertToProvider(provider: InstanceProvider<BlockInstance>) {
    this.blockInstances.forEach(instance => provider.add(instance));
  }

  updateByCameraPosition(pos: Vec3) {
    const barPos = [this.bottomCenter[0], this.bottomCenter[1], this.depth];
    const distance = Math.sqrt(
      (pos[0] - barPos[0]) ** 2 +
        (pos[1] - barPos[1]) ** 2 +
        (pos[2] - barPos[2]) ** 2
    );

    // Will be changed according to requirements
    this.resolution = 60 - 10 * Math.floor(distance / 11);
  }

  updateByDragX(dragX: number) {
    const width = this.width;
    const bottomCenter = this.bottomCenter;
    const baseX = bottomCenter[0] - width / 2;
    const depth = this.depth;
    const color = this.color;
    const baseY = bottomCenter[1];

    this.intervals.forEach(interval => {
      const rightCount = Math.floor((interval.rightX + dragX) / width);
      const leftCount = Math.floor((interval.leftX + dragX) / width);
      const curCount = interval.offsetCount;

      // Right Count > offsetCount, left Count == offsetCount, insects right bound
      // Left Count < offsetCount, right Count == offsetCount, insects left bound
      if (
        (rightCount > curCount && leftCount === curCount) ||
        (leftCount < curCount && rightCount === curCount)
      ) {
        interval.blockInstances.forEach(instance =>
          this.provider.remove(instance)
        );

        interval.blockInstances = [];

        // Get y position of the middle
        const scale =
          (interval.rightX + dragX - rightCount * width) /
          (interval.rightX - interval.leftX);

        const middleY = interval.leftY * scale + interval.rightY * (1 - scale);

        // block1
        const x10 = baseX + interval.leftX - leftCount * width;
        const x11 = baseX + width - dragX;
        const y10 = interval.leftY;
        const y11 = middleY;

        const block1 = new BlockInstance({
          startValue: [x10, y10, depth],
          endValue: [x11, y11, depth],
          baseLine: baseY,
          color
        });

        // block2
        const x20 = baseX - dragX;
        const x21 = baseX + interval.rightX - rightCount * width;
        const y20 = middleY;
        const y21 = interval.rightY;

        const block2 = new BlockInstance({
          startValue: [x20, y20, depth],
          endValue: [x21, y21, depth],
          baseLine: baseY,
          color
        });

        interval.insectBounds = true;
        interval.blockInstances.push(block1);
        interval.blockInstances.push(block2);
        this.provider.add(block1);
        this.provider.add(block2);
      }

      // Right Count > offsetCount, left Count > offsetCount, update offsetCount
      // Right Count < offsetCount, left Count < offsetCount, update offsetCount
      else if (
        (rightCount > curCount && leftCount > curCount) ||
        (rightCount < curCount && leftCount < curCount)
      ) {
        interval.blockInstances.forEach(instance =>
          this.provider.remove(instance)
        );
        interval.blockInstances = [];

        const x0 = interval.leftX - leftCount * width + baseX;
        const x1 = interval.rightX - leftCount * width + baseX;

        const block = new BlockInstance({
          startValue: [x0, interval.leftY, depth],
          endValue: [x1, interval.rightY, depth],
          baseLine: baseY,
          color
        });

        interval.blockInstances.push(block);
        this.provider.add(block);

        interval.offsetCount = leftCount;
        interval.insectBounds = false;
      }

      // Previous insect, current in bounds
      else if (
        interval.insectBounds &&
        leftCount === curCount &&
        rightCount === curCount
      ) {
        interval.blockInstances.forEach(instance =>
          this.provider.remove(instance)
        );

        interval.blockInstances = [];

        const x0 = interval.leftX - curCount * width + baseX;
        const x1 = interval.rightX - curCount * width + baseX;

        const block = new BlockInstance({
          startValue: [x0, interval.leftY, depth],
          endValue: [x1, interval.rightY, depth],
          baseLine: baseY,
          color
        });

        interval.blockInstances.push(block);
        this.provider.add(block);

        interval.insectBounds = false;
      }
    });
  }
}
