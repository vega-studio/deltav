import { Bounds } from "../../math/primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { RingInstance } from "./ring-instance";
export interface IRingLayerProps<T extends RingInstance> extends ILayerProps<T> {
    scaleFactor?(): number;
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
    };
}
export declare class RingLayer<T extends RingInstance, U extends IRingLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IRingLayerProps<RingInstance>;
    static attributeNames: {
        center: string;
        radius: string;
        depth: string;
        color: string;
        thickness: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (ring: RingInstance) => Bounds<{}>;
        hitTest: (ring: RingInstance, point: [number, number], view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RingInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
