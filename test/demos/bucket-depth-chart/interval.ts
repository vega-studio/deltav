import { cross3, InstanceProvider, normalize3, Vec4 } from "src";
import { BlockInstance } from "./block";

export enum IntervalStatus {
  IN,
  OUT,
  INSECT
}

export interface IIntervalOptions {
  leftX: number;
  rightX: number;
  leftY: number;
  rightY: number;
  leftDepth: number;
  rightDepth: number;
  status?: IntervalStatus;
}

export class Interval {
  leftX: number;
  rightX: number;
  leftY: number;
  rightY: number;
  leftDepth: number;
  rightDepth: number;

  blockInstance: BlockInstance | null;
  offsetCount: number = 0;
  insectBounds: boolean = false;
  status: IntervalStatus = IntervalStatus.OUT;

  constructor(options: IIntervalOptions) {
    this.leftX = options.leftX;
    this.rightX = options.rightX;
    this.leftY = options.leftY;
    this.rightY = options.rightY;
    this.leftDepth = options.leftDepth;
    this.rightDepth = options.rightDepth;
    this.status = options.status || this.status;
  }

  createInstance(
    baseX: number,
    baseY: number,
    baseZ: number,
    color: Vec4,
    dragX: number,
    viewWidth: number,
    provider: InstanceProvider<BlockInstance>
  ) {
    const x1 = this.leftX + dragX;
    const x2 = this.rightX + dragX;
    const y1 = this.leftY;
    const y2 = this.rightY;
    const depth1 = this.leftDepth;
    const depth2 = this.rightDepth;

    const leftBound = 0;
    const rightBound = viewWidth;

    if (x1 < rightBound && x2 > leftBound) {
      const leftX = Math.max(x1, leftBound);
      const rightX = Math.min(x2, rightBound);

      const leftScale = (leftX - x1) / (x2 - x1);
      const rightScale = (rightX - x1) / (x2 - x1);

      const leftY = (1 - leftScale) * y1 + leftScale * y2;
      const rightY = (1 - rightScale) * y1 + rightScale * y2;

      const leftDepth = (1 - leftScale) * depth1 + leftScale * depth2;
      const rightDepth = (1 - rightScale) * depth1 + rightScale * depth2;

      const vector1 = normalize3([
        rightX - leftX,
        rightY - leftY,
        (rightDepth - leftDepth) / 2
      ]);

      const vector2 = normalize3([
        rightX - leftX,
        rightY - leftY,
        -(rightDepth - leftDepth) / 2
      ]);

      const normal1 = cross3(vector2, [0, -1, 0]);
      const normal2 = cross3(vector1, [0, 0, -1]);
      const normal3 = cross3([0, -1, 0], vector1);

      const block = new BlockInstance({
        startValue: [leftX - dragX, leftY, leftDepth],
        endValue: [rightX - dragX, rightY, rightDepth],
        baseX,
        baseY,
        baseZ,
        color,
        normal1,
        normal2,
        normal3
      });

      provider.add(block);
      this.blockInstance = block;
    }
  }

  updateInstance(dragX: number, viewWidth: number) {
    if (this.blockInstance) {
      const x1 = this.leftX + dragX;
      const x2 = this.rightX + dragX;
      const y1 = this.leftY;
      const y2 = this.rightY;
      const depth1 = this.leftDepth;
      const depth2 = this.rightDepth;

      const leftBound = 0;
      const rightBound = viewWidth;

      if (x1 < rightBound && x2 > leftBound) {
        const leftX = Math.max(x1, leftBound);
        const rightX = Math.min(x2, rightBound);

        const leftScale = (leftX - x1) / (x2 - x1);
        const rightScale = (rightX - x1) / (x2 - x1);

        const leftY = (1 - leftScale) * y1 + leftScale * y2;
        const rightY = (1 - rightScale) * y1 + rightScale * y2;

        const leftDepth = (1 - leftScale) * depth1 + leftScale * depth2;
        const rightDepth = (1 - rightScale) * depth1 + rightScale * depth2;

        this.blockInstance.startValue = [leftX - dragX, leftY, leftDepth];
        this.blockInstance.endValue = [rightX - dragX, rightY, rightDepth];
      }
    }
  }

  removeInstance(provider: InstanceProvider<BlockInstance>) {
    if (this.blockInstance) {
      provider.remove(this.blockInstance);
      this.blockInstance = null;
    }
  }
}
