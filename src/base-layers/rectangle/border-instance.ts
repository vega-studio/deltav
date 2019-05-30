import { observable } from "../../instance-provider";
import {
  IRectangleInstanceOptions,
  RectangleInstance
} from "./rectangle-instance";

export interface IBorderInstanceOptions extends IRectangleInstanceOptions {
  /** Sets the fontScale of textArea the border locates */
  fontScale?: number;
}

export class BorderInstance extends RectangleInstance {
  /** FontScale is used to help the scaling of border in a right amount */
  @observable fontScale: number = 1;

  constructor(options: IBorderInstanceOptions) {
    super(options);
    this.fontScale = options.fontScale || this.fontScale;
  }
}
