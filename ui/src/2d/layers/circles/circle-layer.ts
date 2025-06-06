import { GLSettings } from "../../../gl";
import { InstanceProvider } from "../../../instance-provider";
import { Vec } from "../../../math";
import { IAutoEasingMethod } from "../../../math/auto-easing-method.js";
import {
  FragmentOutputType,
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  IVertexAttribute,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize,
} from "../../../types.js";
import { CommonMaterialOptions } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { CircleInstance } from "./circle-instance.js";
import CircleLayerFS from "./circle-layer.fs";
import CircleLayerVS from "./circle-layer.vs";
import CircleLayerPointsFS from "./circle-layer-points.fs";
import CircleLayerPointsVS from "./circle-layer-points.vs";

export interface ICircleLayerProps<T extends CircleInstance>
  extends ILayer2DProps<T> {
  /**
   * This is the properties that can toggle on animations.
   *
   * NOTE: The more properties declared as animated will reduce the performance of the layer.
   * if animated properties are created, it can be beneficial to have other layers with no
   * animations be available for the Instances to 'rest' in when not moving.
   */
  animate?: {
    center?: IAutoEasingMethod<Vec>;
    radius?: IAutoEasingMethod<Vec>;
    color?: IAutoEasingMethod<Vec>;
  };
  /** Opacity of the layer as a whole */
  opacity?(): number;
  /**
   * When set, this causes the circles to be rendered utilizing the hardware POINTS mode. POINTS mode has limitations:
   * Different GPUs have different MAX POINT SIZE values, so the points can only be rendered up to a certain size. Also
   * points can have unexpected culling that occurs at the edge of the viewport.
   *
   * However, this mode has GREATLY improved performance when utilized correctly. So use for the correct situation, but
   * beware it's weak 'points' <- this is a pun in the comments of this code base. <- this is me being over zealous in
   * clarifying so the apostraphes don't lead to unecessary conclusions.
   */
  usePoints?: boolean;
}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class CircleLayer<
  T extends CircleInstance,
  U extends ICircleLayerProps<T>,
> extends Layer2D<T, U> {
  static defaultProps: ICircleLayerProps<CircleInstance> = {
    data: new InstanceProvider<CircleInstance>(),
    key: "",
  };

  static attributeNames = {
    center: "center",
    color: "color",
    depth: "depth",
    radius: "radius",
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    const { animate = {}, usePoints = false, opacity = () => 1 } = this.props;

    const {
      center: animateCenter,
      radius: animateRadius,
      color: animateColor,
    } = animate;

    // TL, TR, BL, BR
    const vertexToNormal: number[] = [1, 1, -1, -1, 1, -1];
    const vertexToSide: number[] = [-1, 1, -1, 1, 1, -1];

    const vertexAttributes: IVertexAttribute[] = [
      {
        name: "normals",
        size: VertexAttributeSize.TWO,
        update: (vertex: number) => [
          // Normal
          vertexToNormal[vertex],
          // The side of the quad
          vertexToSide[vertex],
        ],
      },
    ];

    const vertexCount = vertexToNormal.length;

    return {
      // This layer will support changes to the buffering strategy
      instancing: this.props.bufferManagement?.instancing,
      baseBufferGrowthRate: this.props.bufferManagement?.baseBufferGrowthRate,
      // Supports a POINTS or TRIANGLES mode for rendering
      drawMode: usePoints
        ? GLSettings.Model.DrawMode.POINTS
        : GLSettings.Model.DrawMode.TRIANGLES,
      vs: usePoints ? CircleLayerPointsVS : CircleLayerVS,
      fs: usePoints
        ? [
            {
              outputType: FragmentOutputType.COLOR,
              source: CircleLayerPointsFS,
            },
            {
              outputType: FragmentOutputType.GLOW,
              source: `
              void main() {
                $\{out: glow} = color;
              }
              `,
            },
          ]
        : [
            {
              outputType: FragmentOutputType.COLOR,
              source: CircleLayerFS,
            },
            {
              outputType: FragmentOutputType.GLOW,
              source: `
              void main() {
                $\{out: glow} = color;
              }
              `,
            },
          ],
      instanceAttributes: [
        {
          easing: animateCenter,
          name: CircleLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: (circle) => circle.center,
        },
        {
          easing: animateRadius,
          name: CircleLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.radius],
        },
        {
          name: CircleLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.depth],
        },
        {
          easing: animateColor,
          name: CircleLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: (circle) => circle.color,
        },
      ],
      uniforms: [
        {
          name: "layerOpacity",
          size: UniformSize.ONE,
          shaderInjection: ShaderInjectionTarget.ALL,
          update: (_uniform: IUniform) => [opacity()],
        },
      ],
      vertexAttributes: vertexAttributes,
      vertexCount: usePoints ? 1 : vertexCount,
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
