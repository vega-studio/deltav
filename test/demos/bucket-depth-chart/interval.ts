import { BlockInstance } from "./block";

export interface IIntervalOptions {
  leftX: number;
  rightX: number;
  leftY: number;
  rightY: number;
  leftDepth: number;
  rightDepth: number;
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

  constructor(options: IIntervalOptions) {
    this.leftX = options.leftX;
    this.rightX = options.rightX;
    this.leftY = options.leftY;
    this.rightY = options.rightY;
    this.leftDepth = options.leftDepth;
    this.rightDepth = options.rightDepth;
  }
}
