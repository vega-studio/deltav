import { LabelInstance, RectangleInstance } from "src";

export enum BucketType {
  SINGLE,
  /** Rangle can be a range of number or frist letter of a string */
  RANGE
}

export enum BucketValueType {
  STRING,
  NUMBER
}

type BucketValue = string | number;

export interface IBucketOptions {
  type: BucketType;
  valueType: BucketValueType;
  value: BucketValue | [BucketValue, BucketValue];
}

export class Bucket {
  type: BucketType;
  value: BucketValue | [BucketValue, BucketValue];
  valueType: BucketValueType;
  bucketRectangle: RectangleInstance;
  label: LabelInstance;

  constructor(options: IBucketOptions) {
    this.type = options.type;
    this.value = options.value;
    this.valueType = options.valueType;
  }

  /** Determines if a value is in this bucket */
  containsValue(v: BucketValue) {
    if (this.type === BucketType.SINGLE) {
      return this.value === v;
    }

    if (this.valueType === BucketValueType.NUMBER) {
      if (typeof this.value === "object") {
        return v >= this.value[0] && v <= this.value[1];
      }
    }

    if (this.valueType === BucketValueType.STRING) {
      if (typeof this.value === "object") {
        const keyValue = v.toString()[0].toLocaleLowerCase();
        return (
          keyValue.charCodeAt(0) >= this.value[0].toString().charCodeAt(0) &&
          keyValue.charCodeAt(0) <= this.value[1].toString().charCodeAt(0)
        );
      }
    }

    return false;
  }
}
