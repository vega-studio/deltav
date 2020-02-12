import { InstanceProvider } from "../../../instance-provider/instance-provider";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import { Vec } from "../../../math/vector";
import { IFontResourceRequest } from "../../../resources";
import { KernedLayout } from "../../../resources/text/font-map";
import { ILayerConstructionClass, LayerInitializer } from "../../../surface/layer";
import { IPickInfo } from "../../../types";
import { ScaleMode } from "../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
/**
 * Constructor props for making a new label layer
 */
export interface ILabelLayerProps<TInstance extends LabelInstance> extends ILayer2DProps<TInstance> {
    /** Animation methods for various properties of the glyphs */
    animate?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    /** A custom layer to handle rendering glyph instances */
    customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>;
    /** String identifier of the resource font to use for the layer */
    resourceKey?: string;
    /** The scaling strategy the labels will use wheh scaling the scene up and down */
    scaleMode?: ScaleMode;
    /**
     * This defines what characters to use to indicate truncation of labels when needed. This
     * defaults to ellipses or three periods '...'
     */
    truncation?: string;
    /** This indicates whether a label is in a textarea */
    inTextArea?: boolean;
    onMouseClick?(info: IPickInfo<TInstance>): void;
}
/**
 * This is a composite layer that will take in and manage Label Instances. The true instance
 * that will be rendered as a result of a Label Instance will simply be Glyph Instances. Hence
 * this is a composite layer that is merely a manager to split up the label's requested string
 * into Glyphs to render.
 */
export declare class LabelLayer<TInstance extends LabelInstance, TProps extends ILabelLayerProps<TInstance>> extends Layer2D<TInstance, TProps> {
    static defaultProps: ILabelLayerProps<LabelInstance>;
    /**
     * When this is flagged, we must do a complete recomputation of all our label's glyphs positions and kernings.
     * This event really only takes place when the font resource changes.
     */
    fullUpdate: boolean;
    /** Provider for the glyph layer this layer manages */
    glyphProvider: InstanceProvider<GlyphInstance>;
    /**
     * Tracks all assigned glyphs for the given label.
     */
    labelToGlyphs: Map<LabelInstance, GlyphInstance[]>;
    /**
     * This maps a label to it's request made for all of the kerning information needed for the label.
     */
    labelToKerningRequest: Map<LabelInstance, IFontResourceRequest>;
    /**
     * This stores all of the glyphs the label is waiting on to fire the onReady event.
     */
    labelWaitingOnGlyph: Map<LabelInstance, Set<GlyphInstance>>;
    /**
     * These are the property ids for the instances that we need to know when they changed so we can adjust
     * the underlying glyphs.
     */
    propertyIds: {
        [key: string]: number;
    } | undefined;
    /**
     * This stores the kerning request for the truncation characters.
     */
    truncationKerningRequest?: IFontResourceRequest;
    /**
     * This is the width of the truncation glyphs.
     */
    truncationWidth: number;
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
     * Handles first insertion operation for the label
     */
    private insert;
    /**
     * When the glyph is ready to render this executes.
     */
    handleGlyphReady: (glyph: GlyphInstance) => void;
    /**
     * Unmounts all of the glyphs that make the lable
     */
    hideGlyphs(instance: TInstance): void;
    /**
     * Tell the system this layer is not providing any rendering IO information for the GPU to render.
     */
    initShader(): null;
    /**
     * This invalidates the request for the instance thus requiring a new request to be made
     * to trigger the layout of the label.
     */
    invalidateRequest(instance: TInstance): void;
    /**
     * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
     * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
     * will be placed.
     */
    layoutGlyphs(instance: TInstance): void;
    /**
     * This layer does not have or use a buffer manager thus it must track management of an instance
     * in it's own way.
     */
    managesInstance(instance: TInstance): boolean;
    /**
     * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
     */
    showGlyphs(instance: TInstance): void;
    /**
     * Updates the anchor position of the instance when set
     */
    updateAnchor(instance: TInstance): void;
    /**
     * This ensures the correct number of glyphs is being provided for the label indicated.
     */
    updateGlyphs(instance: TInstance, layout: KernedLayout): void;
    /**
     * Updates the glyph colors to match the label's glyph colors
     */
    updateGlyphColors(instance: TInstance): void;
    /**
     * This updates all of the glyphs for the label to have the same position
     * as the label.
     */
    updateGlyphOrigins(instance: TInstance): void;
    /**
     * This updates all of the glyphs for the label to have the same position
     * as the label.
     */
    updateGlyphMaxScales(instance: TInstance): void;
    /**
     * Checks the label to ensure calculated kerning supports the text specified.
     *
     * Returns true when the kerning information is already available
     */
    updateKerning(instance: TInstance): boolean;
    /**
     * If our resource changes, we need a full update of all instances.
     * If our provider changes, we probably want to ensure our property identifiers are correct.
     */
    willUpdateProps(newProps: TProps): void;
}
