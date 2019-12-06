import { FIRFilter } from "@diniden/signal-processing";
import { InstanceProvider, Vec2, Vec3, Vec4 } from "src";
import { BlockInstance } from "./block";
import { Bucket } from "./bucket";
import { Interval, IntervalStatus } from "./interval";
import { PlateEndInstance } from "./plateEnd";

export interface IBarOptions {
  // Sets the center point of the bottom line
  bottomCenter?: Vec2;
  // Sets the color
  color?: Vec4;
  // Contains the time and value information of each point in the chart
  // Data should be sorted by time
  // First element's time should be 0 and last elemet's time should be 1
  barData: Vec3[];
  // Depth of the chart, will help to show layers of chart when view angle is changed
  baseZ?: number;
  // Height scale that will be applied to the value in data array
  heightScale?: number;
  // Sets the unit width, will be applied with duration of each interval
  unitWidth?: number;
  // Sets the width of viewport
  viewWidth?: number;
  viewPortNear?: number;
  viewPortFar?: number;
  groupSize?: number;
  // Provider for block instance
  provider: InstanceProvider<BlockInstance>;
  // Provider for plateEndInstance
  endProvider: InstanceProvider<PlateEndInstance>;

  maxDepth?: number;

  startTime: number;

  heightFilter: FIRFilter;
  depthFilter: FIRFilter;
}

function generateBuckets(data: Vec3[], groupSize: number) {
  const len = data.length;
  if (len === 0) {
    return [];
  }

  const numOfGroups = Math.floor(len / groupSize);
  const buckets = [];

  if (numOfGroups === 0) {
    let time = 0;
    let value = 0;
    let depth = 0;

    data.forEach(d => {
      time += d[0];
      value = Math.max(value, d[1]);
      depth = Math.max(depth, d[2]);
    });

    const bucket = new Bucket({
      time: time / len,
      value,
      data,
      depth
    });

    buckets.push(bucket);
  } else {
    for (let i = 0; i < numOfGroups; i++) {
      let time = 0;
      let value = 0;
      let depth = 0;

      for (let j = 0; j < groupSize; j++) {
        const index = i * groupSize + j;
        time += data[index][0];
        value = Math.max(value, data[index][1]);
        depth = Math.max(depth, data[index][2]);
      }

      // time /= groupSize;

      const bucket = new Bucket({
        time: time / groupSize,
        value,
        data,
        depth
      });

      buckets.push(bucket);
    }
  }

  return buckets;
}

/** A chart which shows data change over time, the chart will always face to the positive Z direction*/
export class Bar {
  // Center of bottom line of the chart
  private _bottomCenter: Vec2 = [0, 0];
  // Color of the chart including opacity
  color: Vec4 = [1, 1, 1, 1];
  // Depth of the chart
  private _baseZ: number = 0;
  // Scale that will be applied for the height of each value
  private _heightScale: number = 1;
  /** Instances that will be generated */
  private blockInstances: BlockInstance[] = [];
  /** Width of the chart */
  // private _width: number;
  private _unitWidth: number = 1;
  /** Width of the viewport */
  viewWidth: number = 10;

  startTime: number;

  viewPortNear: number = Number.MIN_SAFE_INTEGER;
  viewPortFar: number = Number.MAX_SAFE_INTEGER;

  groupSize: number = 1;

  provider: InstanceProvider<BlockInstance>;
  endProvider: InstanceProvider<PlateEndInstance>;

  headBlock: BlockInstance | null = null;
  tailBlcok: BlockInstance | null = null;

  leftEnd: PlateEndInstance | null = null;
  rightEnd: PlateEndInstance | null = null;

  dragX: number = 0;
  scaleX: number = 1;

  data: Vec3[];
  buckets: Bucket[];
  intervals: Interval[] = [];
  maxDepth: number = 0;
  minTime: number = Number.MAX_SAFE_INTEGER;
  maxTime: number = Number.MIN_SAFE_INTEGER;

  heightFilter: FIRFilter = new FIRFilter([]);
  depthFilter: FIRFilter = new FIRFilter([]);

  constructor(options: IBarOptions) {
    this._bottomCenter = options.bottomCenter || this._bottomCenter;
    this.color = options.color || this.color;
    this._baseZ = options.baseZ || this._baseZ;
    this._heightScale = options.heightScale || this._heightScale;
    this.startTime = options.startTime;
    this._unitWidth = options.unitWidth || this._unitWidth;
    this.viewWidth = options.viewWidth || this.viewWidth;
    this.viewPortNear = options.viewPortNear || this.viewPortNear;
    this.viewPortFar = options.viewPortFar || this.viewPortFar;
    this.provider = options.provider;
    this.endProvider = options.endProvider;
    this.data = options.barData;
    this.heightFilter = options.heightFilter || this.heightFilter;
    this.depthFilter = options.depthFilter || this.depthFilter;

    if (this.data.length > 0) {
      this.data.sort((a, b) => a[0] - b[0]);
      this.minTime = this.data[0][0];
      this.maxTime = this.data[this.data.length - 1][0];
    }

    this.maxDepth = options.maxDepth || this.maxDepth;

    this.groupSize = options.groupSize || this.groupSize;

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

      instance.baseY = val[1];
    });

    this._bottomCenter = val;
  }

  get width() {
    if (
      this.maxTime === Number.MIN_SAFE_INTEGER ||
      this.minTime === Number.MAX_SAFE_INTEGER
    ) {
      return 0;
    }

    return (this.maxTime - this.minTime) * this._unitWidth;
  }

  get baseZ() {
    return this._baseZ;
  }

  set baseZ(val: number) {
    // Blocks
    this.intervals.forEach(interval => {
      if (interval.blockInstance) {
        const instance = interval.blockInstance;
        instance.baseZ = val;
      }
    });

    // Ends
    if (this.leftEnd) {
      this.leftEnd.base = [this.leftEnd.base[0], val];
    }

    if (this.rightEnd) {
      this.rightEnd.base = [this.rightEnd.base[0], val];
    }

    // Blocks
    if (this.headBlock) {
      this.headBlock.baseZ = val;
    }

    if (this.tailBlcok) {
      this.tailBlcok.baseZ = val;
    }

    this._baseZ = val;
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

  addData(d: Vec3) {
    this.data.push([
      d[0],
      this.heightFilter.stream(d[1]),
      this.depthFilter.stream(d[2])
    ]);

    if (d[0] > this.maxTime) this.maxTime = d[0];

    this.reDraw();
  }

  removeDataAt(index: number) {
    if (index < 0 || index >= this.data.length) {
      console.error("Index is outside the bound");
    }

    this.data.splice(index, 1);

    this.reDraw();
  }

  reDraw() {
    this.clearAllInstances();

    this.generateInstances(this.data);
  }

  clearAllInstances() {
    this.blockInstances = [];

    this.intervals.forEach(interval => {
      if (interval.blockInstance) {
        this.provider.remove(interval.blockInstance);
        interval.blockInstance = null;
      }
    });

    this.buckets = [];

    this.intervals = [];

    if (this.leftEnd) {
      this.endProvider.remove(this.leftEnd);
      this.leftEnd = null;
    }

    if (this.rightEnd) {
      this.endProvider.remove(this.rightEnd);
      this.rightEnd = null;
    }

    if (this.headBlock) {
      this.provider.remove(this.headBlock);
      this.headBlock = null;
    }

    if (this.tailBlcok) {
      this.provider.remove(this.tailBlcok);
      this.tailBlcok = null;
    }
  }

  updateEndBlocks() {
    const dragX = this.dragX;
    const scaleX = this.scaleX;
    const unitWidth = this._unitWidth;
    const heightScale = this.heightScale;
    const leftBound = 0;
    const rightBound = this.viewWidth;
    const baseX = this.bottomCenter[0] - this.viewWidth / 2;
    const baseY = this.bottomCenter[1];
    const baseZ = this.baseZ;
    const color = this.color;

    const len = this.buckets.length;
    const leftBucket = this.buckets[0];
    const rightBucket = this.buckets[len - 1];
    const leftTime = leftBucket.time;
    const rightTime = rightBucket.time;

    const leftEndX = (leftTime - this.startTime) * unitWidth * scaleX + dragX;
    const leftEndHeight = leftBucket.value * heightScale;
    const leftEndDepth = leftBucket.depth;

    const rightEndX = (rightTime - this.startTime) * unitWidth * scaleX + dragX;
    const rightEndHeight = rightBucket.value * heightScale;
    const rightEndDepth = rightBucket.depth;

    if (leftEndX > leftBound) {
      const rightX = Math.min(leftEndX, rightBound);
      if (this.headBlock) {
        this.headBlock.startValue = [
          (leftBound - dragX) / (scaleX * unitWidth) + this.startTime,
          leftEndHeight,
          leftEndDepth
        ];

        this.headBlock.endValue = [
          (rightX - dragX) / (scaleX * unitWidth) + this.startTime,
          leftEndHeight,
          leftEndDepth
        ];
      } else {
        this.headBlock = new BlockInstance({
          startValue: [
            (leftBound - dragX) / (scaleX * unitWidth) + this.startTime,
            leftEndHeight,
            leftEndDepth
          ],
          endValue: [
            (rightX - dragX) / (scaleX * unitWidth) + this.startTime,
            leftEndHeight,
            leftEndDepth
          ],
          baseX,
          baseY,
          baseZ,
          color,
          normal1: [0, 0, -1],
          normal2: [0, 1, 0],
          normal3: [0, 0, 1]
        });

        this.provider.add(this.headBlock);
      }

      if (this.leftEnd) {
        this.leftEnd.width = leftEndDepth;
        this.leftEnd.height = leftEndHeight;
      } else {
        this.leftEnd = new PlateEndInstance({
          width: leftEndDepth,
          height: leftEndHeight,
          base: [leftBound + baseX, baseZ],
          normal: [-1, 0, 0],
          color
        });

        this.endProvider.add(this.leftEnd);
      }

      if (leftEndX > rightBound) {
        if (this.rightEnd) {
          this.rightEnd.width = leftEndDepth;
          this.rightEnd.height = leftEndHeight;
        } else {
          this.rightEnd = new PlateEndInstance({
            width: leftEndDepth,
            height: leftEndHeight,
            base: [rightBound + baseX, baseZ],
            normal: [1, 0, 0],
            color
          });

          this.endProvider.add(this.rightEnd);
        }
      }
    } else {
      if (this.headBlock) {
        this.provider.remove(this.headBlock);
        this.headBlock = null;
      }
    }

    if (rightEndX < rightBound) {
      const leftX = Math.max(leftBound, rightEndX);
      if (this.tailBlcok) {
        this.tailBlcok.startValue = [
          (leftX - dragX) / (scaleX * unitWidth) + this.startTime,
          rightEndHeight,
          rightEndDepth
        ];
        this.tailBlcok.endValue = [
          (rightBound - dragX) / (scaleX * unitWidth) + this.startTime,
          rightEndHeight,
          rightEndDepth
        ];
      } else {
        this.tailBlcok = new BlockInstance({
          startValue: [
            (leftX - dragX) / (scaleX * unitWidth) + this.startTime,
            rightEndHeight,
            rightEndDepth
          ],
          endValue: [
            (rightBound - dragX) / (scaleX * unitWidth) + this.startTime,
            rightEndHeight,
            rightEndDepth
          ],
          baseX,
          baseY,
          baseZ,
          color,
          normal1: [0, 0, -1],
          normal2: [0, 1, 0],
          normal3: [0, 0, 1]
        });

        this.provider.add(this.tailBlcok);
      }

      if (this.rightEnd) {
        this.rightEnd.width = rightEndDepth;
        this.rightEnd.height = rightEndHeight;
      } else {
        this.rightEnd = new PlateEndInstance({
          width: rightEndDepth,
          height: rightEndHeight,
          base: [rightBound + baseX, baseZ],
          normal: [1, 0, 0],
          color
        });

        this.endProvider.add(this.rightEnd);
      }

      if (rightEndX < leftBound) {
        if (this.leftEnd) {
          this.leftEnd.width = rightEndDepth;
          this.leftEnd.height = rightEndHeight;
        } else {
          this.leftEnd = new PlateEndInstance({
            width: rightEndDepth,
            height: rightEndHeight,
            base: [leftBound + baseX, baseZ],
            normal: [-1, 0, 0],
            color
          });

          this.endProvider.add(this.leftEnd);
        }
      }
    } else {
      if (this.tailBlcok) {
        this.provider.remove(this.tailBlcok);
        this.tailBlcok = null;
      }
    }
  }

  private generateInstances(data: Vec3[]) {
    /*if (data.length <= 1) {
      console.error(
        "A bucket depth chart needs at least two elements in data array"
      );
    }*/

    this.buckets = generateBuckets(data, this.groupSize);

    const unitWidth = this._unitWidth;
    const viewWidth = this.viewWidth;
    const heightScale = this.heightScale;
    const bottomCenter = this.bottomCenter;
    const color = this.color;
    const baseX = bottomCenter[0] - viewWidth / 2;
    const baseY = bottomCenter[1];
    const baseZ = this.baseZ;
    const dragX = this.dragX;
    const scaleX = this.scaleX;
    const leftBound = 0;
    const rightBound = viewWidth;

    // console.warn(this.buckets.length);

    if (this.buckets.length <= 1) {
      const len = this.buckets.length;
      const basicHeight = len === 0 ? 1 : this.buckets[0].value * heightScale;
      const basicDepth = len === 0 ? 0.5 : this.buckets[0].depth;

      // console.warn(this.buckets[0]);

      if (this.headBlock) {
        this.headBlock.startValue = [
          (leftBound - dragX) / (scaleX * unitWidth) + this.startTime,
          basicHeight,
          basicDepth
        ];

        this.headBlock.endValue = [
          (rightBound - dragX) / (scaleX * unitWidth) + this.startTime,
          basicHeight,
          basicDepth
        ];
      } else {
        this.headBlock = new BlockInstance({
          startValue: [
            (leftBound - dragX) / (scaleX * unitWidth) + this.startTime,
            basicHeight,
            basicDepth
          ],
          endValue: [
            (rightBound - dragX) / (scaleX * unitWidth) + this.startTime,
            basicHeight,
            basicDepth
          ],
          baseX,
          baseY,
          baseZ,
          color,
          normal1: [0, 0, -1],
          normal2: [0, 1, 0],
          normal3: [0, 0, 1]
        });

        this.provider.add(this.headBlock);
      }

      if (this.leftEnd) {
        this.leftEnd.width = basicDepth;
        this.leftEnd.height = basicHeight;
      } else {
        this.leftEnd = new PlateEndInstance({
          width: basicDepth,
          height: basicHeight,
          base: [leftBound + baseX, baseZ],
          normal: [-1, 0, 0],
          color
        });

        this.endProvider.add(this.leftEnd);
      }

      if (this.rightEnd) {
        this.rightEnd.width = basicDepth;
        this.rightEnd.height = basicHeight;
      } else {
        this.rightEnd = new PlateEndInstance({
          width: basicDepth,
          height: basicHeight,
          base: [rightBound + baseX, baseZ],
          normal: [1, 0, 0],
          color
        });

        this.endProvider.add(this.rightEnd);
      }
    } else {
      for (let i = 0, endi = this.buckets.length; i < endi - 1; i++) {
        const bucket = this.buckets[i];
        const nextBucket = this.buckets[i + 1];

        const x1 = (bucket.time - this.startTime) * unitWidth * scaleX + dragX;
        const x2 =
          (nextBucket.time - this.startTime) * unitWidth * scaleX + dragX;
        const y1 = bucket.value * heightScale;
        const y2 = nextBucket.value * heightScale;
        const depth1 = bucket.depth;
        const depth2 = nextBucket.depth;

        const interval = new Interval({
          leftX: bucket.time,
          rightX: nextBucket.time,
          leftY: y1,
          rightY: y2,
          leftDepth: depth1,
          rightDepth: depth2
        });

        if (x1 < rightBound && x2 > leftBound) {
          if (x1 >= leftBound && x2 <= rightBound) {
            interval.status = IntervalStatus.IN;
          } else {
            interval.status = IntervalStatus.INSECT;
          }

          interval.createInstance(
            baseX,
            baseY,
            baseZ,
            color,
            scaleX,
            dragX,
            unitWidth,
            viewWidth,
            this.startTime,
            this.provider
          );

          // End plate on the left
          if (x1 <= leftBound && x2 > leftBound) {
            const leftX = Math.max(x1, leftBound);
            const leftScale = (leftX - x1) / (x2 - x1);
            const leftY = (1 - leftScale) * y1 + leftScale * y2;
            const leftDepth = (1 - leftScale) * depth1 + leftScale * depth2;

            if (this.leftEnd) {
              this.leftEnd.width = leftDepth;
              this.leftEnd.height = leftY;
            } else {
              this.leftEnd = new PlateEndInstance({
                width: leftDepth,
                height: leftY,
                base: [leftBound + baseX, baseZ],
                normal: [-1, 0, 0],
                color
              });

              this.endProvider.add(this.leftEnd);
            }
          }

          // End plate on the right
          if (x2 >= rightBound && x1 < rightBound) {
            const rightX = Math.min(x2, rightBound);
            const rightScale = (rightX - x1) / (x2 - x1);
            const rightY = (1 - rightScale) * y1 + rightScale * y2;
            const rightDepth = (1 - rightScale) * depth1 + rightScale * depth2;

            if (this.rightEnd) {
              this.rightEnd.width = rightDepth;
              this.rightEnd.height = rightY;
            } else {
              this.rightEnd = new PlateEndInstance({
                width: rightDepth,
                height: rightY,
                base: [rightBound + baseX, baseZ],
                normal: [1, 0, 0],
                color
              });

              this.endProvider.add(this.rightEnd);
            }
          }
        }

        this.intervals.push(interval);
      }

      this.updateEndBlocks();
    }
  }

  updateByDragX(dragX: number) {
    this.dragX = dragX;
    const scaleX = this.scaleX;
    const viewWidth = this.viewWidth;
    const bottomCenter = this.bottomCenter;
    const baseX = bottomCenter[0] - viewWidth / 2;
    const baseY = bottomCenter[1];
    const baseZ = this.baseZ;
    const color = this.color;
    const leftBound = 0;
    const rightBound = viewWidth;
    const unitWidth = this._unitWidth;

    if (this.intervals.length === 0) {
      const len = this.buckets.length;
      const basicHeight =
        len === 0 ? 1 : this.buckets[0].value * this.heightScale;
      const basicDepth = len === 0 ? 0.5 : this.buckets[0].depth;
      if (this.headBlock) {
        this.headBlock.startValue = [
          (leftBound - dragX) / (scaleX * unitWidth) + this.startTime,
          basicHeight,
          basicDepth
        ];

        this.headBlock.endValue = [
          (rightBound - dragX) / (scaleX * unitWidth) + this.startTime,
          basicHeight,
          basicDepth
        ];
      }
    } else if (this.intervals.length !== 0) {
      this.intervals.forEach(interval => {
        const x1 =
          (interval.leftX - this.startTime) * unitWidth * scaleX + dragX;
        const x2 =
          (interval.rightX - this.startTime) * unitWidth * scaleX + dragX;
        // Inside bound
        if (x1 >= leftBound && x2 <= rightBound) {
          // update
          if (interval.status === IntervalStatus.INSECT) {
            interval.updateInstance(
              dragX,
              scaleX,
              unitWidth,
              viewWidth,
              this.startTime
            );
          }
          // create
          else if (interval.status === IntervalStatus.OUT) {
            interval.createInstance(
              baseX,
              baseY,
              baseZ,
              color,
              scaleX,
              dragX,
              unitWidth,
              viewWidth,
              this.startTime,
              this.provider
            );
          }

          interval.status = IntervalStatus.IN;
        }

        // Insect bound
        else if (
          (x1 < leftBound && x2 > leftBound) ||
          (x1 < rightBound && x2 > rightBound)
        ) {
          // update
          if (interval.status !== IntervalStatus.OUT) {
            interval.updateInstance(
              dragX,
              scaleX,
              unitWidth,
              viewWidth,
              this.startTime
            );
          }
          // create
          else {
            interval.createInstance(
              baseX,
              baseY,
              baseZ,
              color,
              scaleX,
              dragX,
              unitWidth,
              viewWidth,
              this.startTime,
              this.provider
            );
          }

          interval.status = IntervalStatus.INSECT;
        }

        // Outside bound
        else {
          // Remove
          if (interval.status !== IntervalStatus.OUT) {
            interval.removeInstance(this.provider);
          }

          interval.status = IntervalStatus.OUT;
        }

        // End plate on the left
        if (x1 <= leftBound && x2 > leftBound) {
          if (this.leftEnd) {
            this.leftEnd.update(
              interval,
              leftBound,
              scaleX,
              dragX,
              unitWidth,
              this.startTime
            );
          } else {
            const leftScale = (leftBound - x1) / (x2 - x1);
            const y1 = interval.leftY;
            const y2 = interval.rightY;
            const depth1 = interval.leftDepth;
            const depth2 = interval.rightDepth;
            const height = (1 - leftScale) * y1 + leftScale * y2;
            const width = (1 - leftScale) * depth1 + leftScale * depth2;
            this.leftEnd = new PlateEndInstance({
              width,
              height,
              base: [leftBound + baseX, baseZ],
              normal: [-1, 0, 0]
            });
          }
        }

        // End plate on the right
        if (x2 >= rightBound && x1 < rightBound) {
          if (this.rightEnd) {
            this.rightEnd.update(
              interval,
              rightBound,
              scaleX,
              dragX,
              unitWidth,
              this.startTime
            );
          } else {
            const rightScale = (rightBound - x1) / (x2 - x1);
            const y1 = interval.leftY;
            const y2 = interval.rightY;
            const depth1 = interval.leftDepth;
            const depth2 = interval.rightDepth;
            const height = (1 - rightScale) * y1 + rightScale * y2;
            const width = (1 - rightScale) * depth1 + rightScale * depth2;
            this.leftEnd = new PlateEndInstance({
              width,
              height,
              base: [rightBound + baseX, baseZ],
              normal: [1, 0, 0]
            });
          }
        }
      });

      this.updateEndBlocks();
    }
  }

  updateByScaleX(scaleX: number, dragX: number, groupSize?: number) {
    this.scaleX = scaleX;
    this.dragX = dragX;

    if (groupSize && groupSize !== this.groupSize) {
      this.groupSize = groupSize || this.groupSize;
      this.reDraw();
    }

    this.updateByDragX(dragX);
  }

  updateByDragZ(dragZ: number) {
    const fadePadding = 1;

    const nearFadeStart = this.viewPortNear + fadePadding;
    const farFadeStart = this.viewPortFar - fadePadding;

    const posZ = this.baseZ + dragZ;
    let alpha = 0.0;

    if (posZ > farFadeStart && posZ < this.viewPortFar) {
      alpha = 0.9 * (this.viewPortFar - posZ) / fadePadding;
    } else if (posZ > this.viewPortNear && posZ < nearFadeStart) {
      alpha = 0.9 * (posZ - this.viewPortNear) / fadePadding;
    } else if (posZ >= nearFadeStart && posZ <= farFadeStart) {
      alpha = 0.9;
    }

    this.color = [this.color[0], this.color[1], this.color[2], alpha];
  }
}
