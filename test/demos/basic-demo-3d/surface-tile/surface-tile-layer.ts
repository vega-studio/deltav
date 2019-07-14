import { Vec2 } from "@diniden/signal-processing";
import {
  CommonMaterialOptions,
  createAttribute,
  createVertex,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  VertexAttributeSize
} from "../../../../src";
import { SurfaceTileInstance } from "./surface-tile-instance";

export class SurfaceTileLayer extends Layer<
  SurfaceTileInstance,
  ILayerProps<SurfaceTileInstance>
> {
  static defaultProps: ILayerProps<SurfaceTileInstance> = {
    key: "",
    data: new InstanceProvider<SurfaceTileInstance>()
  };

  initShader(): IShaderInitialization<SurfaceTileInstance> {
    const positions: number[] = [
      // up
      1,
      2,
      3,
      1,
      3,
      4
    ];

    const tex: Vec2[] = [
      [0.0, 0.0],
      [1.0, 0.0],
      [1.0, 1.0],

      [0.0, 0.0],
      [1.0, 1.0],
      [0.0, 1.0]
    ];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require("./surface-tile-layer.fs"),
      instanceAttributes: [
        createAttribute({
          name: "c1",
          size: InstanceAttributeSize.THREE,
          update: o => o.c1
        }),
        createAttribute({
          name: "c2",
          size: InstanceAttributeSize.THREE,
          update: o => o.c2
        }),
        createAttribute({
          name: "c3",
          size: InstanceAttributeSize.THREE,
          update: o => o.c3
        }),
        createAttribute({
          name: "c4",
          size: InstanceAttributeSize.THREE,
          update: o => o.c4
        }),
        createAttribute({
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        })
      ],
      uniforms: [],
      vertexAttributes: [
        createVertex({
          name: "corner",
          size: VertexAttributeSize.ONE,
          update: (vertex: number) => [positions[vertex]]
        }),
        createVertex({
          name: "texCoord",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex]
        })
      ],
      vertexCount: 6,
      vs: require("./surface-tile-layer.vs")
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE
    });
  }
}
