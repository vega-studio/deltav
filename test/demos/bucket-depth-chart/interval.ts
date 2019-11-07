import { BlockInstance } from "src";

export interface IIntervalOptions {
  leftX: number;
  rightX: number;
  leftY: number;
  rightY: number;
}

export class Interval {
  leftX: number;
  rightX: number;
  leftY: number;
  rightY: number;

  blockInstances: BlockInstance[] = [];
  offsetCount: number = 0;
  insectBounds: boolean = false;

  constructor(options: IIntervalOptions) {
    this.leftX = options.leftX;
    this.rightX = options.rightX;
    this.leftY = options.leftY;
    this.rightY = options.rightY;
  }

  addInstance(instance: BlockInstance) {
    this.blockInstances.push(instance);
  }
}
