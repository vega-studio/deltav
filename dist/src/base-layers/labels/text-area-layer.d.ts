import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerConstructionClass, LayerInitializer } from "../../surface/layer-surface";
import { IProjection } from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec } from "../../util/vector";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { TextAreaInstance } from "./text-area-instance";
export interface ITextAreaLayerProps<T extends LabelInstance> extends ILayerProps<T> {
    animate?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>;
    resourceKey?: string;
    whiteSpaceKerning?: number;
}
export declare class TextAreaLayer<T extends TextAreaInstance, U extends ITextAreaLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ITextAreaLayerProps<TextAreaInstance>;
    labelProvider: InstanceProvider<LabelInstance>;
    propertyIds: {
        [key: string]: number;
    } | undefined;
    fullUpdate: boolean;
    areaToLabels: Map<TextAreaInstance, LabelInstance[]>;
    areaToLines: Map<TextAreaInstance, LabelInstance[][]>;
    areaWaitingOnLabel: Map<TextAreaInstance, Set<LabelInstance>>;
    getInstancePickingMethods(): {
        boundsAccessor: (label: T) => Bounds<{}>;
        hitTest: (label: T, point: [number, number], view: IProjection) => boolean;
    };
    childLayers(): LayerInitializer[];
    draw(): void;
    handleLabelReady: (label: LabelInstance) => void;
    hideLabels(instance: T): void;
    initShader(): null;
    layoutLabels(instance: T): void;
    managesInstance(instance: T): boolean;
    showGlyphs(instance: T): void;
    updateLabels(_instance: T): void;
    updateLabelColors(instance: T): void;
    updateLabelFontSizes(instance: T): void;
    updateLabelOrigins(instance: T): void;
    willUpdateProps(newProps: U): void;
}
