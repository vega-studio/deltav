import { BlockInstance, Vec2 } from "src";

export interface IBucketOptions {
  time: number;
  value: number;
  data: Vec2[];
}

export class Bucket {
  time: number;
  value: number;
  data: Vec2[];
  blockInstances: BlockInstance[] = [];

  constructor(options: IBucketOptions) {
    this.data = options.data;
    this.time = options.time;
    this.value = options.value;
  }
}
