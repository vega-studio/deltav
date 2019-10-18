import { Control2D } from "../../2d";
import { Instance } from "../../instance-provider/instance";
import { ILayerConstructable, ILayerProps } from "../../surface/layer";
import { Omit } from "../../types";
export declare enum Axis2D {
    XY = 0,
    XZ = 1,
    YZ = 2
}
export declare function createLayer2Din3D<T extends Instance, U extends ILayerProps<T>>(axis2D: Axis2D, classType: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">> & {
    control2D: Control2D;
}): import("../../surface/layer").LayerInitializer;
