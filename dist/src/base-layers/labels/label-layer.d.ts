import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../math/primitives";
import { IFontResourceRequest } from "../../resources";
import { KernedLayout } from "../../resources/text/font-map";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerConstructionClass, LayerInitializer } from "../../surface/surface";
import { IProjection } from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec } from "../../util/vector";
import { ScaleMode } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
export interface ILabelLayerProps<T extends LabelInstance> extends ILayerProps<T> {
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
}
export declare class LabelLayer<T extends LabelInstance, U extends ILabelLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ILabelLayerProps<LabelInstance>;
    glyphProvider: InstanceProvider<GlyphInstance>;
    propertyIds: {
        [key: string]: number;
    } | undefined;
    fullUpdate: boolean;
    labelToGlyphs: Map<LabelInstance, GlyphInstance[]>;
    labelToKerningRequest: Map<LabelInstance, IFontResourceRequest>;
    labelWaitingOnGlyph: Map<LabelInstance, Set<GlyphInstance>>;
    truncationKerningRequest?: IFontResourceRequest;
    truncationWidth: number;
    getInstancePickingMethods(): {
        boundsAccessor: (label: T) => Bounds<{}>;
        hitTest: (label: T, point: [number, number], view: IProjection) => boolean;
    };
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
