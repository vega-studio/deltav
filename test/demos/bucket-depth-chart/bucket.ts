import { Vec3 } from "src";
import { BlockInstance } from "./block";

export interface IBucketOptions {
  time: number;
  value: number;
  depth: number;
  data: Vec3[];
}

export class Bucket {
  time: number;
  value: number;
  depth: number;
  data: Vec3[];
  blockInstances: BlockInstance[] = [];

  constructor(options: IBucketOptions) {
    this.data = options.data;
    this.time = options.time;
    this.value = options.value;
    this.depth = options.depth;
  }
}
