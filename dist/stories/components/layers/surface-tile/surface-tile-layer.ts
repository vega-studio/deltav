import FS from "./surface-tile-layer.fs";
import VS from "./surface-tile-layer.vs";
import {
  AutoEasingMethod,
  CommonMaterialOptions,
  createAttribute,
  createVertex,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec2,
  VertexAttributeSize,
} from "../../../../src";
import { SurfaceTileInstance } from "./surface-tile-instance";

export class SurfaceTileLayer extends Layer<
  SurfaceTileInstance,
  ILayerProps<SurfaceTileInstance>
> {
  static defaultProps: ILayerProps<SurfaceTileInstance> = {
    key: "",
    data: new InstanceProvider<SurfaceTileInstance>(),
  };

  static attributeNames = {
    c1: "c1",
    c2: "c2",
    c3: "c3",
    c4: "c4",
  };

  initShader(): IShaderInitialization<SurfaceTileInstance> {
    const positions: number[] = [
      // up
      1, 2, 3, 1, 3, 4,
    ];

    const tex: Vec2[] = [
      [0.0, 0.0],
      [1.0, 0.0],
      [1.0, 1.0],

      [0.0, 0.0],
      [1.0, 1.0],
      [0.0, 1.0],
    ];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: FS,
      instanceAttributes: [
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: SurfaceTileLayer.attributeNames.c1,
          size: InstanceAttributeSize.THREE,
          update: (o) => o.c1,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: SurfaceTileLayer.attributeNames.c2,
          size: InstanceAttributeSize.THREE,
          update: (o) => o.c2,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: SurfaceTileLayer.attributeNames.c3,
          size: InstanceAttributeSize.THREE,
          update: (o) => o.c3,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: SurfaceTileLayer.attributeNames.c4,
          size: InstanceAttributeSize.THREE,
          update: (o) => o.c4,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        createVertex({
          name: "corner",
          size: VertexAttributeSize.ONE,
          update: (vertex: number) => [positions[vertex]],
        }),
        createVertex({
          name: "texCoord",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex],
        }),
      ],
      vertexCount: 6,
      vs: VS,
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE,
    });
  }
}
