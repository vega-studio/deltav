import { Control2D, Layer2D } from "../../2d";
import { createLayer } from "../../util/create-layer";
import { ILayerConstructable, ILayerProps } from "../../surface/layer";
import { Instance } from "../../instance-provider/instance";
import { IShaderInitialization, Omit } from "../../types";

/**
 * Specifies a 2D axis system within a 3D world.
 */
export enum Axis2D {
  /** X-axis remains x-axis and y-axis remains y-axis */
  XY,
  /** X-axis remains x-axis and y-axis is now mapped to the z axis */
  XZ,
  /** X-axis is mapped to the z-axis and the y-axis remains y-axis */
  YZ,
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
export function createLayer2Din3D<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
>(
  axis2D: Axis2D,
  classType: ILayerConstructable<TInstance, TProps> & { defaultProps: TProps },
  props: Omit<TProps, "key" | "data"> &
    Partial<Pick<TProps, "key" | "data">> & { control2D: Control2D }
) {
  const doesInheritLayer2D =
    classType === Layer2D || classType.prototype instanceof Layer2D;

  if (!doesInheritLayer2D) {
    console.warn(
      "A Layer type was specified for createLayer2din3D that is NOT a Layer2D type, which is invalid.",
      "The layer will be used without being modified."
    );
    return createLayer(classType, props);
  }

  let newModule: string;

  switch (axis2D) {
    case Axis2D.XY:
      newModule = "world2DXY";
      break;
    case Axis2D.XZ:
      newModule = "world2DXZ";
      break;
    case Axis2D.YZ:
      newModule = "world2DYZ";
      break;

    default:
      return createLayer(classType, props);
  }

  const modifiedProps = Object.assign({}, props, {
    baseShaderModules: (
      _shaderIO: IShaderInitialization<Instance>,
      layerModules: { fs: string[]; vs: string[] }
    ) => {
      // We remove the world 2D module to replace it with our custom module that will handle the projections correctly.
      let world2DIndex = layerModules.vs.indexOf("world2D");

      if (world2DIndex >= 0) {
        layerModules.vs.splice(world2DIndex, 1, newModule);
      }

      world2DIndex = layerModules.fs.indexOf("world2D");

      if (world2DIndex >= 0) {
        layerModules.fs.splice(world2DIndex, 1, newModule);
      }

      return layerModules;
    },
  });

  return createLayer(classType, modifiedProps);
}
