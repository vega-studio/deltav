import { InstanceProvider } from "../../../instance-provider/instance-provider";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import { Vec } from "../../../math/vector";
import { IFontResourceRequest } from "../../../resources";
import { ILayerConstructionClass, LayerInitializer } from "../../../surface/layer";
import { ScaleMode } from "../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { BorderInstance } from "./border-instance";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { TextAlignment, TextAreaInstance, TextAreaLabel } from "./text-area-instance";
/**
 * Constructor props for making a new label layer
 */
export interface ITextAreaLayerProps<T extends LabelInstance> extends ILayer2DProps<T> {
    /** Animation methods for various properties of the glyphs */
    animateLabel?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    /** Animation methods fro various properties of the borders */
    animateBorder?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
    };
    /** A custom layer to handle rendering glyph instances */
    customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>;
    /** String identifier of the resource font to use for the layer */
    resourceKey?: string;
    /** This number represents how much space each whitespace character represents */
    whiteSpaceKerning?: number;
    /** This sets the scaling mode of textArea, cound be ALWAYS, BOUND_MAX or NEVER */
    scaling?: ScaleMode;
}
/**
 * This is a composite layer that will take in and manage Label Instances. The true instance
 * that will be rendered as a result of a Label Instance will simply be Glyph Instances. Hence
 * this is a composite layer that is merely a manager to split up the label's requested string
 * into Glyphs to render.
 */
export declare class TextAreaLayer<T extends TextAreaInstance, U extends ITextAreaLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: ITextAreaLayerProps<TextAreaInstance>;
    providers: {
        /** Provider for the label layer this layer manages */
        labels: InstanceProvider<LabelInstance>;
        /** Provider for the border layer that renders the border of text area */
        borders: InstanceProvider<BorderInstance>;
    };
    /**
     * These are the property ids for the instances that we need to know when they changed so we can adjust
     * the underlying glyphs.
     */
    propertyIds: {
        [key: string]: number;
    } | undefined;
    /**
     * When this is flagged, we must do a complete recomputation of all our label's glyphs positions and kernings.
     * This event really only takes place when the font resource changes.
     */
    fullUpdate: boolean;
    /** Tracks all assigned labels to the text area */
    areaToLabels: Map<TextAreaInstance, TextAreaLabel[]>;
    /** Tracks the labels assigned to an area and are grouped by the line they appear within */
    areaToLines: Map<TextAreaInstance, LabelInstance[][]>;
    /** This stores all of the glyphs the label is waiting on to fire the onReady event. */
    areaWaitingOnLabel: Map<TextAreaInstance, Set<LabelInstance>>;
    /** This stores kerningRequest of TextAreaInstance */
    areaTokerningRequest: Map<TextAreaInstance, IFontResourceRequest>;
    /** This stores splited words of a textArea */
    areaToWords: Map<TextAreaInstance, string[]>;
    labelsInLine: LabelInstance[];
    /**
     * This provides the child layers that will render on behalf of this layer.
     *
     * For Labels, a label is simply a group of well placed glyphs. So we defer all of
     * the labels changes by converting the label into glyphs and applying the changes to
     * it's set of glyphs.
     */
    childLayers(): LayerInitializer[];
    /**
     * We override the draw method of the layer to handle the diffs of the provider in a
     * custom fashion by delegating the changes of the provider to the child layers.
     */
    draw(): void;
    /**
     * Handles insertion operation for the textArea
     */
    private insert;
    /**
     * When the glyph is ready to render this executes.
     */
    handleLabelReady: (label: LabelInstance) => void;
    /**
     * Unmount all of the glyphs that make the label
     */
    hideLabels(instance: T): void;
    /**
     * Tell the system this layer is not providing any rendering IO information for the GPU to render.
     */
    initShader(): null;
    /** When text is changed, labels should be clear in order to generate new labels */
    clear(instance: T): void;
    /** When a label exceeds the maxWidth of a textArea, sperate it into several parts */
    seperateLabel(instance: TextAreaInstance, label: LabelInstance, glyphToHeight: Map<string, number>, word: string, index: number, currentX: number, currentY: number, spaceWidth: number, glyphWidths: number[]): [number, number];
    /**
     * This updates textAreaInstance after lineWrap is changed
     */
    updateLabelLineWrap(instance: T): void;
    /**
     * This updates textAreaInstance after lineHeight is changed
     */
    updateLabelLineHeight(instance: T): void;
    /**
     * This updates textAreaInstance after textArea width or height is changed
     */
    updateTextAreaSize(instance: T): void;
    /**
     * Update thickness of border
     */
    updateBorderWidth(instance: T): void;
    /**
     * Update the border of textArea to remove border or add border
     */
    updateBorder(instance: T): void;
    /**
     * Update letterSpacing of all labels in textArea
     */
    updateLetterSpacing(instance: T): void;
    /**
     * Sets the alignment of TextArea by adjusting all the labels' origin
     */
    setTextAlignment(currentX: number, currentY: number, spaceWidth: number, maxWidth: number, alignment: TextAlignment): void;
    /**
     * Layout the border of textAreaInstance
     */
    layoutBorder(instance: T): void;
    /**
     * Calculate the positions of labels
     */
    layoutLabels(instance: T): void;
    /**
     * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
     * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
     * will be placed.
     */
    layout(instance: T): void;
    /**
     * Update kerning of textArea Instance, retrieve kerning request from map or create a new one
     */
    updateKerning(instance: T): boolean;
    /**
     * This layer does not have or use a buffer manager thus it must track management of an instance
     * in it's own way.
     */
    managesInstance(instance: T): boolean;
    /**
     * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
     */
    showLabels(instance: T): void;
    /**
     * This ensures the correct number of glyphs is being provided for the label indicated.
     */
    updateLabels(instance: T): void;
    /**
     * Updates the label colors to match the label's label colors
     */
    updateLabelColors(instance: T): void;
    /**
     * Updates fontsize of all labels
     */
    updateLabelFontSizes(instance: T): void;
    /**
     * This updates all of the labels for the label to have the same position
     * as the label.
     */
    updateLabelOrigins(instance: T): void;
    /**
     * If our resource changes, we need a full update of all instances.
     * If our provider changes, we probably want to ensure our property identifiers are correct.
     */
    willUpdateProps(newProps: U): void;
}
