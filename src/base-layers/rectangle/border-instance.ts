import { Vec2 } from "src/util";
import { observable } from "../../instance-provider";
import {
  IRectangleInstanceOptions,
  RectangleInstance
} from "./rectangle-instance";

export interface IBorderInstanceOptions extends IRectangleInstanceOptions {
  /** Sets the fontScale of textArea the border locates */
  fontScale?: number;
  /** Sets the textArea's origin where the border is in */
  textAreaOrigin?: Vec2;
  /** Set the textArea's anchor where the border is in */
  textAreaAnchor?: Vec2;
}

export class BorderInstance extends RectangleInstance {
  /** FontScale is used to help the scaling of border in a right amount */
  @observable fontScale: number = 1;
  /** TextArea's origin where the border is in */
  @observable textAreaOrigin: Vec2 = [0, 0];
  /** TextArea's anchor where the border is in */
  @observable textAreaAnchor: Vec2 = [0, 0];

  constructor(options: IBorderInstanceOptions) {
    super(options);
    this.fontScale = options.fontScale || this.fontScale;
    this.textAreaOrigin = options.textAreaOrigin || this.textAreaOrigin;
    this.textAreaAnchor = options.textAreaAnchor || this.textAreaAnchor;
  }
}
