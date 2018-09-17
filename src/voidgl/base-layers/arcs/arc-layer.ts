import * as Three from "three";
import { InstanceProvider } from "../../instance-provider";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import {
  IMaterialOptions,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { CommonMaterialOptions, IAutoEasingMethod, Vec } from "../../util";
import { ArcInstance } from "./arc-instance";

export enum ArcScaleType {
  /** All dimensions are within world space */
  NONE,
  /**
   * The thickness of the arc is in screen space. Thus, camera zoom changes will not affect it and
   * must be controlled by scaleFactor alone.
   */
  SCREEN_CURVE
}

export interface IArcLayerProps<T extends ArcInstance> extends ILayerProps<T> {
  scaleType?: ArcScaleType;
  animate?: {
    colorStart?: IAutoEasingMethod<Vec>;
    colorEnd?: IAutoEasingMethod<Vec>;
  };
}

/**
 * This layer displays Arcs and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class ArcLayer<
  T extends ArcInstance,
  U extends IArcLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IArcLayerProps<ArcInstance> = {
    data: new InstanceProvider<ArcInstance>(),
    key: "",
    scaleType: ArcScaleType.NONE
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ArcInstance> {
    const { scaleType } = this.props;
    const animations = this.props.animate || {};
    const {
      colorStart: animateColorStart,
      colorEnd: animateColorEnd,
    } = animations;

    const MAX_SEGMENTS = 50;

    // Calculate the normals and interpolations for our vertices
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      [MAX_SEGMENTS * 2 + 2]: -1
    };

    const vertexInterpolation: { [key: number]: number } = {
      0: 0,
      [MAX_SEGMENTS * 2 + 2]: 1
    };

    let sign = 1;
    for (let i = 0; i < MAX_SEGMENTS * 2; ++i) {
      vertexToNormal[i + 1] = sign;
      vertexInterpolation[i + 1] = Math.floor(i / 2) / (MAX_SEGMENTS - 1);
      sign *= -1;
    }

    const vs =
      scaleType === ArcScaleType.NONE
        ? require("./arc-layer.vs")
        : require("./arc-layer-screen-space.vs");

    return {
      fs: require("./arc-layer.fs"),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: "center",
          size: InstanceAttributeSize.TWO,
          update: o => o.center
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: "radius",
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius]
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.FOUR,
          name: "depth",
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: "thickness",
          size: InstanceAttributeSize.TWO,
          update: o => o.thickness
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.THREE,
          name: "angle",
          size: InstanceAttributeSize.TWO,
          update: o => o.angle
        },
        {
          block: 2,
          blockIndex: InstanceBlockIndex.ONE,
          easing: animateColorStart,
          name: "colorStart",
          size: InstanceAttributeSize.FOUR,
          update: o => o.colorStart
        },
        {
          block: 3,
          blockIndex: InstanceBlockIndex.ONE,
          easing: animateColorEnd,
          name: "colorEnd",
          size: InstanceAttributeSize.FOUR,
          update: o => o.colorEnd
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [1]
        }
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexInterpolation[vertex],
            // The number of vertices
            MAX_SEGMENTS * 2
          ]
        }
      ],
      vertexCount: MAX_SEGMENTS * 2 + 2,
      vs
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return Object.assign({}, CommonMaterialOptions.transparentShape, {
      side: Three.DoubleSide
    } as IMaterialOptions);
  }
}
