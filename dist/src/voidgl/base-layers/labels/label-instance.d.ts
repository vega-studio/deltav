import { Label } from '../../primitives/label';
import { IInstanceOptions, Instance } from '../../util/instance';
export declare enum AnchorType {
    BottomLeft = 0,
    BottomMiddle = 1,
    BottomRight = 2,
    Custom = 3,
    Middle = 4,
    MiddleLeft = 5,
    MiddleRight = 6,
    MiddleTop = 7,
    TopLeft = 8,
    TopRight = 9,
}
export interface ILabelInstanceOptions extends IInstanceOptions, Label {
    /**
     * The point on the label which will be placed in world space. This is also the point
     * which the label will be scaled around.
     */
    anchor: {
        type: AnchorType;
        x: number;
        y: number;
    };
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
export declare class LabelInstance extends Instance implements Label {
    color: [number, number, number, number];
    fontFamily: string;
    fontSize: number;
    fontStyle: string;
    fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | 'inherit' | 'initial' | 'unset' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    text: string;
    constructor(options: ILabelInstanceOptions);
    readonly width: number;
    readonly height: number;
}
