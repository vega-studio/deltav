import {
  AutoEasingMethod,
  CommonMaterialOptions,
  FragmentOutputType,
  GLSettings,
  ILayer2DProps,
  ILayerMaterialOptions,
  IndexBufferSize,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  IUniform,
  IVertexAttribute,
  Layer2D,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize,
} from "../../../../src/index.js";
import type { VertexPackingCircleInstance } from "./vertex-packing-circle-instance.js";
import CircleLayerFS from "./vertex-packing-circle-layer.fs";
import CircleLayerVS from "./vertex-packing-circle-layer.vs";

export interface IVertexPackingCircleLayerProps<
  T extends VertexPackingCircleInstance,
> extends ILayer2DProps<T> {
  /** Opacity of the layer as a whole */
  opacity?(): number;
}

/**
 * This layer renders:
 * A poorly optimized circle that causes vertex packing to happen in the buffer
 * management (there is more vertex information than available vertex attributes
 * thus causing multiple vertex atttributes to be packed into a single vertex.)
 */
export class VertexPackingCircleLayer<
  T extends VertexPackingCircleInstance,
  U extends IVertexPackingCircleLayerProps<T>,
> extends Layer2D<T, U> {
  static defaultProps: IVertexPackingCircleLayerProps<VertexPackingCircleInstance> =
    {
      data: new InstanceProvider<VertexPackingCircleInstance>(),
      key: "",
    };

  static attributeNames = {
    center: "center",
    color: "color",
    color2: "color2",
    depth: "depth",
    radius: "radius",
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<VertexPackingCircleInstance> {
    const { opacity = () => 1 } = this.props;

    // TL, TR, BL, BR
    const vertexToNormal: number[] = [1, 1, -1, -1];
    const vertexToSide: number[] = [-1, 1, -1, 1];
    const indices: number[] = [0, 1, 2, 1, 3, 2];

    // const vertexToNormal: number[] = [1, 1, -1, 1, -1, -1];
    // const vertexToSide: number[] = [-1, 1, -1, 1, 1, -1];

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
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: CircleLayerVS,
      fs: [
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
          easing: AutoEasingMethod.easeInOutCubic(1000),
          name: VertexPackingCircleLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: (circle) => circle.center,
        },
        {
          easing: AutoEasingMethod.easeInOutCubic(1000),
          name: VertexPackingCircleLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.radius],
        },
        {
          name: VertexPackingCircleLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.depth],
        },
        {
          easing: AutoEasingMethod.easeInOutCubic(1000),
          name: VertexPackingCircleLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: (circle) => circle.color,
        },
        {
          easing: AutoEasingMethod.easeInOutCubic(1000),
          name: VertexPackingCircleLayer.attributeNames.color2,
          size: InstanceAttributeSize.FOUR,
          update: (circle) => circle.color2,
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
      vertexCount: vertexCount,
      indexBuffer: {
        size: IndexBufferSize.UINT8,
        indexCount: 6,
        update: (i) => indices[i],
      },
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
