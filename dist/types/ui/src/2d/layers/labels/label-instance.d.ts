import { IInstanceOptions, Instance } from "../../../instance-provider/instance.js";
import { Vec2 } from "../../../math";
import { Size } from "../../../types.js";
import { Anchor } from "../../types.js";
import { GlyphInstance } from "./glyph-instance.js";
import { TextAreaInstance } from "./text-area-instance.js";
export interface ILabelInstanceOptions extends IInstanceOptions {
    /**
     * The point on the label which will be placed in world space via the x, y coords. This is also the point
     * which the label will be scaled around.
     */
    anchor?: Anchor;
    /** The color the label should render as */
    color: [number, number, number, number];
    /** Depth sorting of the label (or the z value of the label) */
    depth?: number;
    /** The font size of the label in px */
    fontSize?: number;
    /** When this is set labels will only draw the label up to this size. If below, the label will automatically truncate with ellipses */
    maxWidth?: number;
    /** When in BOUND_MAX mode, this allows the label to scale up beyond it's max size */
    maxScale?: number;
    /** Scales the label uniformly */
    scale?: number;
    /** The text rendered by this label*/
    text: string;
    /** The xy coordinate where the label will be anchored to in world space */
    origin: Vec2;
    /**
     * Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's
     * Kerning is calculated.
     */
    preload?: boolean;
    /** Spacing width between letters in a label */
    letterSpacing?: number;
    /** Event when the label is completely ready to render all of it's glyphs */
    onReady?(instance: LabelInstance): void;
}
/**
 * This generates a new label instance which will render a single line of text for a given layer.
 * There are restrictions surrounding labels due to texture sizes and rendering limitations.
 */
export declare class LabelInstance extends Instance {
    /** This is the rendered color of the label */
    color: [number, number, number, number];
    /** Depth sorting of the label (or the z value of the label) */
    depth: number;
    /**
     * Font size in world coordinates. This causes scaling relative to the base font resource available.
     * IE- If the font resource is rendered at 32 and this is 16, then the output rendering will
     *     be glyphs that are 50% the size of the rendered glyph in the font map. This can cause
     *     artefacts based on the rendering strategy used.
     */
    fontSize: number;
    /** When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size */
    maxScale: number;
    /**
     * This is the maximum width the label can take up. If this is exceeded the label gets truncated.
     * A max width of 0 or less is unbounded and will not truncate the text. When a max width is specified,
     * there will always be a minimum requirement to show ellipses which inevitably causes a min width to
     * arise and is dependent on the font in use.
     */
    maxWidth: number;
    /** The x coordinate where the label will be anchored to in world space */
    origin: Vec2;
    /** Scales the label uniformly */
    scale: number;
    /** The rendered text for the label. */
    text: string;
    /** Spacing between letters in a label */
    letterSpacing: number;
    /** This executes when the label is finished waiting for it's glyphs to be ready to render */
    onReady?: (label: LabelInstance) => void;
    /** The text area this label is associated with (may NOT be associated at all) */
    parentTextArea?: TextAreaInstance;
    /**
     * Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's
     * Kerning is calculated.
     */
    preload: boolean;
    /**
     * After the label has been rendered, this will be populated with all of the glyphs that
     * have been created for the label. Using this you can manipulate each character very easily.
     *
     * NOTE: it helps to use nextFrame() to wait for this to be populated after the label has been mounted.
     */
    glyphs: GlyphInstance[];
    /**
     * After the label has been rendered, this will be populated with the calculated width and height of the
     * label.
     */
    size: Size;
    /**
     * If a maxWidth is specified, there is a chance the text will be truncated.
     * This provides the calculated truncated text. If not populated, then no truncation
     * has happened.
     */
    truncatedText: string;
    /** This is the anchor location relative to the label's render space */
    anchor: Anchor;
    constructor(options: ILabelInstanceOptions);
    getWidth(): number;
    /**
     * This applies a new anchor to this label and properly determines it's anchor position on the label
     */
    setAnchor(anchor: Anchor): void;
    /**
     * Looks for the subtext provided, then provides the glyphs for that subtext if any.
     */
    subTextGlyphs(text: string): GlyphInstance[];
    /**
     * Trigger for when resources are prepped for this instance
     */
    resourceTrigger(): void;
}
