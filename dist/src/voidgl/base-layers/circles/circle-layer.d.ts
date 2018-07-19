import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection } from "../../types";
import { Vec } from "../../util";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { CircleInstance } from "./circle-instance";
export interface ICircleLayerProps extends ILayerProps<CircleInstance> {
    fadeOutOversized?: number;
    scaleFactor?(): number;
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
}
export declare class CircleLayer extends Layer<CircleInstance, ICircleLayerProps> {
    static defaultProps: ICircleLayerProps;
    getInstancePickingMethods(): {
        boundsAccessor: (circle: CircleInstance) => Bounds;
        hitTest: (circle: CircleInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<CircleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
