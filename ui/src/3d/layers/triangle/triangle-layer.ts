import { GLSettings } from "../../../gl";
import { InstanceProvider } from "../../../instance-provider";
import { Vec3 } from "../../../math/vector.js";
import { ILayerProps, Layer } from "../../../surface/layer.js";
import {
  InstanceAttributeSize,
  IShaderInitialization,
  VertexAttributeSize,
} from "../../../types.js";
import { CommonMaterialOptions, createAttribute } from "../../../util";
import { IdentityTransform } from "../../scene-graph";
import { TriangleInstance } from "./triangle-instance.js";
import TriangleLayerFS from "./triangle-layer.fs";
import TriangleLayerVS from "./triangle-layer.vs";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ITriangleLayerProps<TInstance extends TriangleInstance>
  extends ILayerProps<TInstance> {}

/**
 * Layer for rendering simple Triangle primitives
 */
export class TriangleLayer<
  TInstance extends TriangleInstance,
  TProps extends ITriangleLayerProps<TInstance>,
> extends Layer<TInstance, TProps> {
  static defaultProps: ITriangleLayerProps<TriangleInstance> = {
    data: new InstanceProvider<TriangleInstance>(),
    key: "",
    materialOptions: CommonMaterialOptions.transparentShapeBlending,
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const positions: Vec3[] = [
      [0, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
    ];

    const forward: Vec3 = [0, 0, 1];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: TriangleLayerFS,
      instanceAttributes: [
        createAttribute({
          name: "transform",
          size: InstanceAttributeSize.MAT4X4,
          update: (o) => (o.transform || IdentityTransform).matrix,
        }),
        createAttribute({
          name: "size",
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.size],
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => positions[vertex],
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: () => forward,
        },
      ],
      vertexCount: 3,
      vs: TriangleLayerVS,
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE,
    });
  }
}
