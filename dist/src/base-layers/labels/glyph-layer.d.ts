import { IFontResourceRequest } from "../../resources";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { ScaleMode } from "../types";
import { GlyphInstance } from "./glyph-instance";
export interface IGlyphLayerOptions<T extends GlyphInstance> extends ILayerProps<T> {
    animate?: {
        anchor?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
        offset?: IAutoEasingMethod<Vec>;
        origin?: IAutoEasingMethod<Vec>;
    };
    resourceKey?: string;
    scaleMode?: ScaleMode;
}
export declare class GlyphLayer<T extends GlyphInstance, U extends IGlyphLayerOptions<T>> extends Layer<T, U> {
    static defaultProps: IGlyphLayerOptions<GlyphInstance>;
    static attributeNames: {
        color: string;
        depth: string;
        anchor: string;
        origin: string;
        offset: string;
    };
    glyphRequests: {
        [key: string]: IFontResourceRequest;
    };
    initShader(): IShaderInitialization<T>;
    draw(): void;
    getMaterialOptions(): ILayerMaterialOptions;
    willUpdateProps(nextProps: U): void;
}
