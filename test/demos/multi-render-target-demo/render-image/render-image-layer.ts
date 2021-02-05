import {
  CommonMaterialOptions,
  ILayerMaterialOptions,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  UniformSize,
  VertexAttributeSize
} from "../../../../src";
import { textureRequest } from "../../../../src/resources/texture/render-texture-resource-request";
import { RenderImageInstance } from "./render-image-instance";

export interface IRenderImageLayerProps<TInstance extends RenderImageInstance>
  extends ILayerProps<TInstance> {
  /** This is the resource */
  resource: string;
}

/**
 * Layer for rendering simple cube primitives
 */
export class RenderImageLayer<
  TInstance extends RenderImageInstance,
  TProps extends IRenderImageLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: IRenderImageLayerProps<any> = {
    key: "",
    data: new InstanceProvider<RenderImageInstance>(),
    resource: "",
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<RenderImageInstance> {
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      fs: require("./image-layer.fs"),
      instanceAttributes: [
        {
          name: "position",
          size: InstanceAttributeSize.TWO,
          update: o => o.position
        },
        {
          name: "size",
          size: InstanceAttributeSize.TWO,
          update: o => o.size
        },
        {
          name: "resource",
          resource: {
            key: () => this.props.resource || "",
            name: "resource"
          },
          update: o =>
            this.resource.request(this, o, textureRequest({
              key: this.props.resource
            }))
        },
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex]
          ]
        }
      ],
      vertexCount: 6,
      vs: require("./image-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentImageBlending;
  }
}
