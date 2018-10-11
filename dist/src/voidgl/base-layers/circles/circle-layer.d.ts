import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { Vec } from "../../util";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { CircleInstance } from "./circle-instance";
export interface ICircleLayerProps<T extends CircleInstance> extends ILayerProps<T> {
    fadeOutOversized?: number;
    scaleFactor?(): number;
    disableDepthTest?: boolean;
    opacity?: number;
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
}
export declare class CircleLayer<T extends CircleInstance, U extends ICircleLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ICircleLayerProps<CircleInstance>;
    static attributeNames: {
        center: string;
        radius: string;
        depth: string;
        color: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (circle: CircleInstance) => Bounds;
        hitTest: (circle: CircleInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<CircleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
