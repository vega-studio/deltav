import { InstanceProvider } from "../../../instance-provider/instance-provider";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import { Vec } from "../../../math/vector";
import { IFontResourceRequest } from "../../../resources";
import { KernedLayout } from "../../../resources/text/font-map";
import { ILayerConstructionClass, LayerInitializer } from "../../../surface/layer";
import { ScaleMode } from "../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
export interface ILabelLayerProps<T extends LabelInstance> extends ILayer2DProps<T> {
    animate?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>;
    resourceKey?: string;
    scaleMode?: ScaleMode;
    truncation?: string;
    inTextArea?: boolean;
}
export declare class LabelLayer<T extends LabelInstance, U extends ILabelLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: ILabelLayerProps<LabelInstance>;
    fullUpdate: boolean;
    glyphProvider: InstanceProvider<GlyphInstance>;
    labelToGlyphs: Map<LabelInstance, GlyphInstance[]>;
    labelToKerningRequest: Map<LabelInstance, IFontResourceRequest>;
    labelWaitingOnGlyph: Map<LabelInstance, Set<GlyphInstance>>;
    propertyIds: {
        [key: string]: number;
    } | undefined;
    truncationKerningRequest?: IFontResourceRequest;
    truncationWidth: number;
    childLayers(): LayerInitializer[];
    draw(): void;
    private insert;
    handleGlyphReady: (glyph: GlyphInstance) => void;
    hideGlyphs(instance: T): void;
    initShader(): null;
    invalidateRequest(instance: T): void;
    layoutGlyphs(instance: T): void;
    managesInstance(instance: T): boolean;
    showGlyphs(instance: T): void;
    updateAnchor(instance: T): void;
    updateGlyphs(instance: T, layout: KernedLayout): void;
    updateGlyphColors(instance: T): void;
    updateGlyphOrigins(instance: T): void;
    updateGlyphMaxScales(instance: T): void;
    updateKerning(instance: T): boolean;
    willUpdateProps(newProps: U): void;
}
