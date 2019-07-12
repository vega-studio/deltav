import { IFontResourceRequest } from "../../../src/resources";
import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../math/primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerConstructionClass, LayerInitializer } from "../../surface/surface";
import { IProjection } from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec } from "../../util/vector";
import { RectangleInstance } from "../rectangle";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { TextAreaInstance, TextAreaLabel } from "./text-area-instance";
export interface ITextAreaLayerProps<T extends LabelInstance> extends ILayerProps<T> {
    animateLabel?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    animateBorder?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
    };
    customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>;
    resourceKey?: string;
    whiteSpaceKerning?: number;
}
export declare class TextAreaLayer<T extends TextAreaInstance, U extends ITextAreaLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ITextAreaLayerProps<TextAreaInstance>;
    providers: {
        labels: InstanceProvider<LabelInstance>;
        rectangles: InstanceProvider<RectangleInstance>;
    };
    propertyIds: {
        [key: string]: number;
    } | undefined;
    fullUpdate: boolean;
    areaToLabels: Map<TextAreaInstance, TextAreaLabel[]>;
    areaToLines: Map<TextAreaInstance, LabelInstance[][]>;
    areaWaitingOnLabel: Map<TextAreaInstance, Set<LabelInstance>>;
    areaTokerningRequest: Map<TextAreaInstance, IFontResourceRequest>;
    areaToWords: Map<TextAreaInstance, string[]>;
    getInstancePickingMethods(): {
        boundsAccessor: (TextArea: T) => Bounds<{}>;
        hitTest: (TextArea: T, point: [number, number], view: IProjection) => boolean;
    };
    childLayers(): LayerInitializer[];
    draw(): void;
    private insert;
    handleLabelReady: (label: LabelInstance) => void;
    hideLabels(instance: T): void;
    initShader(): null;
    clear(instance: T): void;
    seperateLabel(instance: TextAreaInstance, label: LabelInstance, glyphToHeight: Map<string, number>, word: string, index: number, currentX: number, currentY: number, spaceWidth: number, glyphWidths: number[]): [number, number];
    updateLabelLineWrap(instance: T): void;
    updateLabelLineHeight(instance: T): void;
    updateTextAreaSize(instance: T): void;
    updateBorderWidth(instance: T): void;
    updateBorder(instance: T): void;
    updateLetterSpacing(instance: T): void;
    layoutBorder(instance: T): void;
    layoutLabels(instance: T): void;
    layout(instance: T): void;
    updateKerning(instance: T): boolean;
    managesInstance(instance: T): boolean;
    showLabels(instance: T): void;
    updateLabels(instance: T): void;
    updateLabelColors(instance: T): void;
    updateLabelFontSizes(instance: T): void;
    updateLabelOrigins(instance: T): void;
    willUpdateProps(newProps: U): void;
}
