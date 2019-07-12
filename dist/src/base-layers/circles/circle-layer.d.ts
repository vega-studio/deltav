import { Bounds } from "../../math/primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { Vec } from "../../util";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { CircleInstance } from "./circle-instance";
export interface ICircleLayerProps<T extends CircleInstance> extends ILayerProps<T> {
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
    scaleFactor?(): number;
    opacity?(): number;
    usePoints?: boolean;
}
export declare class CircleLayer<T extends CircleInstance, U extends ICircleLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ICircleLayerProps<CircleInstance>;
    static attributeNames: {
        center: string;
        color: string;
        depth: string;
        radius: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (circle: CircleInstance) => Bounds<{}>;
        hitTest: (circle: CircleInstance, point: [number, number], view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<CircleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
