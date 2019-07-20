import { Bounds } from "../../math/primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { RectangleInstance } from "./rectangle-instance";
export interface IRectangleLayerProps<T extends RectangleInstance> extends ILayerProps<T> {
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
    };
    atlas?: string;
    scaleFactor?(): number;
}
export declare class RectangleLayer<T extends RectangleInstance, U extends IRectangleLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IRectangleLayerProps<RectangleInstance>;
    static attributeNames: {
        anchor: string;
        color: string;
        depth: string;
        location: string;
        maxScale: string;
        scale: string;
        scaling: string;
        size: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (rectangle: RectangleInstance) => Bounds<{}>;
        hitTest: (rectangle: RectangleInstance, point: [number, number], projection: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RectangleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
