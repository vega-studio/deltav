import { Label } from '../../primitives/label';
import { LabelAtlasResource } from '../../surface/texture';
import { IInstanceOptions, Instance } from '../../util/instance';
import { Anchor, ScaleType } from '../types';
export interface ILabelInstanceOptions extends IInstanceOptions, Partial<Label> {
    /**
     * The point on the label which will be placed in world space via the x, y coords. This is also the point
     * which the label will be scaled around.
     */
    anchor?: Anchor;
    /** The color the label should render as */
    color: [number, number, number, number];
    /** Depth sorting of the label (or the z value of the label) */
    depth?: number;
    /** The font of the label */
    fontFamily?: string;
    /** The font size of the label in px */
    fontSize?: number;
    /** Stylization of the font */
    fontStyle?: Label['fontStyle'];
    /** The weight of the font */
    fontWeight?: Label['fontWeight'];
    /** This allows for control over rasterization to the atlas */
    rasterization?: {
        /**
         * This is the scale of the rasterization on the atlas. Higher numbers increase atlas usage, but can provide
         * higher quality render outputs to the surface.
         */
        scale: number;
    };
    /** Sets the way the label scales with the world */
    scaling?: ScaleType;
    /** Scales the label uniformly */
    scale?: number;
    /** This will be the text that should render with  */
    text: string;
    /** The x coordinate where the label will be anchored to in world space */
    x?: number;
    /** The y coordinate where the label will be anchored to in world space */
    y?: number;
}
/**
 * This generates a new label instance which will render a single line of text for a given layer.
 * There are restrictions surrounding labels due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a label via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Labels should only be so long.
 * - Multiline is not supported inherently
 * - Once a label is constructed, only SOME properties can be altered thereafter
 *
 * A label that is constructed can only have some properties set upon creating the label and are locked
 * thereafter. The only way to modify them would be to destroy the label, then construct a new label
 * with the modifications. This has to deal with performance regarding rasterizing the label
 */
export declare class LabelInstance extends Instance implements Label {
    /** This is the rendered color of the label */
    color: [number, number, number, number];
    /** Depth sorting of the label (or the z value of the label) */
    depth: number;
    /** Sets the way the label scales with the world */
    scaling: ScaleType;
    /** Scales the label uniformly */
    scale: number;
    /** The x coordinate where the label will be anchored to in world space */
    x: number;
    /** The y coordinate where the label will be anchored to in world space */
    y: number;
    private _cssFont;
    private _fontFamily;
    private _fontSize;
    private _fontStyle;
    private _fontWeight;
    private _text;
    private _width;
    private _height;
    private _isDestroyed;
    private _rasterization;
    /**
     * This is the full css string that represents this label. This + the text of the label is essentially
     * a unique identifier for the rendering of the label and is used to key the rasterization of the label
     * so that label rasterization can be shared for similar labels.
     */
    readonly cssFont: string;
    /** This flag indicates if this label is valid anymore */
    readonly isDestroyed: boolean;
    /** This is the font family of the label */
    readonly fontFamily: string;
    /**
     * This is the size of the label in pixels. For Labels, this correlates to the rendering font size.
     * The true pixel height of the label is calculated and placed into the height property for the label.
     */
    readonly fontSize: number;
    /** This is the style of the font (italic, oblique, etc) */
    readonly fontStyle: "normal" | "inherit" | "initial" | "italic" | "oblique";
    /** This is the font weight specified for the label (bold, normal, etc). */
    readonly fontWeight: 100 | 300 | "normal" | "bold" | "bolder" | "lighter" | "inherit" | "initial" | "unset" | 200 | 400 | 500 | 600 | 700 | 800 | 900;
    /** This gets the atlas resource that is uniquely identified for this label */
    readonly resource: LabelAtlasResource;
    /** This is the label's text. */
    readonly text: string;
    /**
     * This is the width in world space of the label. If there is no camera distortion,
     * this would be the width of the label in pixels on the screen.
     */
    readonly width: number;
    /**
     * This is the height in world space of the label. If there is no camera distortion,
     * this would be the height of the label in pixels on the screen.
     */
    readonly height: number;
    /** This is the anchor location on the  */
    private _anchor;
    constructor(options: ILabelInstanceOptions);
    /**
     * Labels are a sort of unique case where the use of a label should be destroyed as rasterization
     * resources are in a way kept alive through reference counting.
     */
    destroy(): void;
    readonly anchor: Anchor;
    /**
     * This applies a new anchor to this label and properly determines it's anchor position on the label
     */
    setAnchor(anchor: Anchor): void;
}
