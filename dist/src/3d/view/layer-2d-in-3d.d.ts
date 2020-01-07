import { Control2D } from "../../2d";
import { Instance } from "../../instance-provider/instance";
import { ILayerConstructable, ILayerProps } from "../../surface/layer";
import { Omit } from "../../types";
/**
 * Specifies a 2D axis system within a 3D world.
 */
export declare enum Axis2D {
    /** X-axis remains x-axis and y-axis remains y-axis */
    XY = 0,
    /** X-axis remains x-axis and y-axis is now mapped to the z axis */
    XZ = 1,
    /** X-axis is mapped to the z-axis and the y-axis remains y-axis */
    YZ = 2
}
/**
 * This method provides a means for a layer2d to be injected into a 3d world along a different axis system. This way
 * the 2d elements can render their positional information in the correct manner within the 3D world and remain
 * versatile enough to be used in many cases without having to render into a rendering context and then into the
 * 3D world.
 *
 * Mapped 2D layers will sometimes behave as expected and sometimes will not. For instance: rendering labels within
 * the 3D space will merely render their anchor position correctly within 3D but will not render the glyphs flat along
 * the axis. The glyphs will actually remain upright and rendered within the screen space.
 *
 * To render elements truly flat within the 3D world, use a render target first, then render the target within the 3D
 * world.
 */
export declare function createLayer2Din3D<T extends Instance, U extends ILayerProps<T>>(axis2D: Axis2D, classType: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">> & {
    control2D: Control2D;
}): import("../../surface/layer").LayerInitializer;
