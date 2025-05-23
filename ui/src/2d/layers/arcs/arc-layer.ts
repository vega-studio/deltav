import { GLSettings } from "../../../gl";
import { InstanceProvider } from "../../../instance-provider";
import { IAutoEasingMethod, Vec } from "../../../math";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize,
} from "../../../types.js";
import { CommonMaterialOptions } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { ArcInstance } from "./arc-instance.js";
import ArcLayerFS from "./arc-layer.fs";
import ArcLayerVS from "./arc-layer.vs";
import ArcLayerScreenSpaceVS from "./arc-layer-screen-space.vs";

export enum ArcScaleType {
  /** All dimensions are within world space */
  NONE,
  /**
   * The thickness of the arc is in screen space. Thus, camera zoom changes will not affect it and
   * must be controlled by scaleFactor alone.
   */
  SCREEN_CURVE,
}

export interface IArcLayerProps<T extends ArcInstance>
  extends ILayer2DProps<T> {
  scaleType?: ArcScaleType;
  animate?: {
    angle?: IAutoEasingMethod<Vec>;
    angleOffset?: IAutoEasingMethod<Vec>;
    center?: IAutoEasingMethod<Vec>;
    colorEnd?: IAutoEasingMethod<Vec>;
    colorStart?: IAutoEasingMethod<Vec>;
    radius?: IAutoEasingMethod<Vec>;
    thickness?: IAutoEasingMethod<Vec>;
  };
}

/**
 * This layer displays Arcs and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class ArcLayer<
  T extends ArcInstance,
  U extends IArcLayerProps<T>,
> extends Layer2D<T, U> {
  static defaultProps: IArcLayerProps<ArcInstance> = {
    data: new InstanceProvider<ArcInstance>(),
    key: "",
    scaleType: ArcScaleType.NONE,
  };

  /** Easy lookup of all attribute names for the layer */
  static attributeNames = {
    angle: "angle",
    angleOffset: "angleOffset",
    center: "center",
    colorEnd: "colorEnd",
    colorStart: "colorStart",
    depth: "depth",
    radius: "radius",
    thickness: "thickness",
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ArcInstance> {
    const { scaleType } = this.props;
    const animations = this.props.animate || {};
    const {
      angle: animateAngle,
      angleOffset: animateAngleOffset,
      center: animateCenter,
      radius: animateRadius,
      thickness: animateThickness,
      colorStart: animateColorStart,
      colorEnd: animateColorEnd,
    } = animations;

    const MAX_SEGMENTS = 150;

    // Calculate the normals and interpolations for our vertices
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      [MAX_SEGMENTS * 2 + 2]: -1,
    };

    const vertexInterpolation: { [key: number]: number } = {
      0: 0,
      [MAX_SEGMENTS * 2 + 2]: 1,
    };

    let sign = 1;
    for (let i = 0; i < MAX_SEGMENTS * 2; ++i) {
      vertexToNormal[i + 1] = sign;
      vertexInterpolation[i + 1] = Math.floor(i / 2) / (MAX_SEGMENTS - 1);
      sign *= -1;
    }

    const vs =
      scaleType === ArcScaleType.NONE ? ArcLayerVS : ArcLayerScreenSpaceVS;

    return {
      fs: ArcLayerFS,
      instanceAttributes: [
        {
          easing: animateCenter,
          name: ArcLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.center,
        },
        {
          easing: animateRadius,
          name: ArcLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.radius],
        },
        {
          name: ArcLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          easing: animateThickness,
          name: ArcLayer.attributeNames.thickness,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.thickness,
        },
        {
          easing: animateAngle,
          name: ArcLayer.attributeNames.angle,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.angle,
        },
        {
          easing: animateAngleOffset,
          name: ArcLayer.attributeNames.angleOffset,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.angleOffset],
        },
        {
          easing: animateColorStart,
          name: ArcLayer.attributeNames.colorStart,
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.colorStart,
        },
        {
          easing: animateColorEnd,
          name: ArcLayer.attributeNames.colorEnd,
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.colorEnd,
        },
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_u) => [1],
        },
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexInterpolation[vertex],
            // The number of vertices
            MAX_SEGMENTS * 2,
          ],
        },
      ],
      vertexCount: MAX_SEGMENTS * 2 + 2,
      vs,
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      culling: GLSettings.Material.CullSide.NONE,
    } as ILayerMaterialOptions);
  }
}
