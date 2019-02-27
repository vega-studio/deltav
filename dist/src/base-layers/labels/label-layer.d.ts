import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { LabelInstance } from "./label-instance";
export interface ILabelLayerProps<T extends LabelInstance> extends ILayerProps<T> {
    atlas?: string;
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
    };
}
export declare class LabelLayer<T extends LabelInstance, U extends ILabelLayerProps<T>> extends Layer<T, U> {
    static defaultProps: ILabelLayerProps<LabelInstance>;
    static attributeNames: {
        location: string;
        anchor: string;
        size: string;
        depth: string;
        scaling: string;
        texture: string;
        color: string;
        scale: string;
        maxScale: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (label: LabelInstance) => Bounds;
        hitTest: (label: LabelInstance, point: [number, number], view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<LabelInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
