import { IAutoEasingMethod, Vec } from "../../../math";
import { IFontResourceRequest } from "../../../resources";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ScaleMode } from "../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { GlyphInstance } from "./glyph-instance";
/**
 * Options available to this layer as props.
 */
export interface IGlyphLayerOptions<T extends GlyphInstance> extends ILayer2DProps<T> {
    /** Specifies which attributes to animate */
    animate?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    /** This is the font resource this pulls from in order to render the glyphs */
    resourceKey?: string;
    /** This is the scaling strategy the glyph will use when text is involved. */
    scaleMode?: ScaleMode;
    /** This indicates whether a glyph is in a textArea */
    inTextArea?: boolean;
}
/**
 * Handles rendering single character glyphs using SDF and MSDF techniques
 */
export declare class GlyphLayer<T extends GlyphInstance, U extends IGlyphLayerOptions<T>> extends Layer2D<T, U> {
    /** Set up the default props so our auto complete is a happier place */
    static defaultProps: IGlyphLayerOptions<GlyphInstance>;
    /**
     * Easy access names of each attribute to make easing controls easier
     */
    static attributeNames: {
        color: string;
        depth: string;
        anchor: string;
        origin: string;
        offset: string;
    };
    /**
     * These are all of the requests the glyphs have generated for each character. This let's us
     * recycle requests for same glyphs.
     */
    glyphRequests: {
        [key: string]: IFontResourceRequest;
    };
    /**
     * Create the Shader IO needed to tie our instances and the GPU together.
     */
    initShader(): IShaderInitialization<T>;
    draw(): void;
    /**
     * Set up material options for the layer
     */
    getMaterialOptions(): ILayerMaterialOptions;
    /**
     * Handle changes that need special handling
     */
    willUpdateProps(nextProps: U): void;
}
