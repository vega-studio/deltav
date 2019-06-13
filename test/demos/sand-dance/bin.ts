export enum BinType {
  SINGLE,
  RANGE
}

export enum BinValueType {
  STRING,
  NUMBER
}

type BinValue = string | number;

export interface IBinOptions {
  type: BinType;
  valueType: BinValueType;
  value: BinValue | [BinValue, BinValue];
}

export class Bin {
  type: BinType;
  value: BinValue | [BinValue, BinValue];
  valueType: BinValueType;

  constructor(options: IBinOptions) {
    this.type = options.type;
    this.value = options.value;
    this.valueType = options.valueType;
  }

  containsValue(v: BinValue) {
    if (this.type === BinType.SINGLE) {
      return this.value === v;
    }

    if (this.valueType === BinValueType.NUMBER) {
      if (typeof this.value === "object") {
        return v >= this.value[0] && v <= this.value[1];
      }
    }

    if (this.valueType === BinValueType.STRING) {
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
