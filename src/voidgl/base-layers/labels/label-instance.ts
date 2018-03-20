import { computed, observable } from 'mobx';
import { Label } from '../../primitives/label';
import { IInstanceOptions, Instance } from '../../util/instance';

export enum AnchorType {
  BottomLeft,
  BottomMiddle,
  BottomRight,
  Custom,
  Middle,
  MiddleLeft,
  MiddleRight,
  MiddleTop,
  TopLeft,
  TopRight,
}

export interface ILabelInstanceOptions extends IInstanceOptions, Label {
  /**
   * The point on the label which will be placed in world space. This is also the point
   * which the label will be scaled around.
   */
  anchor: {
    type: AnchorType,
    x: number,
    y: number,
  }
  /** The color the label should render as */
  color: [number, number, number, number];
  /** The font of the label */
  fontFamily: string;
  /** The font size of the label in px */
  fontSize: number;
  /** Stylization of the font */
  fontStyle: string;
  /** The weight of the font */
  fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | 'inherit' | 'initial' | 'unset' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** This will be the text that should render with  */
  text: string;
}

export class LabelInstance extends Instance implements Label {
  color: [number, number, number, number];
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | 'inherit' | 'initial' | 'unset' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  text: string;

  constructor(options: ILabelInstanceOptions) {
    super(options);

    this.color = options.color;
    this.fontFamily = options.fontFamily;
    this.x = options.x;
    this.y = options.y;
    this.depth = options.depth;
  }

  @computed
  get width() {
    return this.radius * 2;
  }

  @computed
  get height() {
    return this.radius * 2;
  }
}
