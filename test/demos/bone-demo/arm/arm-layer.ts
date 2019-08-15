import {
  CommonMaterialOptions,
  createAttribute,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec3,
  VertexAttributeSize
} from "../../../../src";
import { ArmInstance } from "./arm-instance";

export interface IArmLayerProps<TInstance extends ArmInstance>
  extends ILayerProps<TInstance> {}

export class ArmLayer<
  TInstance extends ArmInstance,
  TProps extends IArmLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: IArmLayerProps<ArmInstance> = {
    data: new InstanceProvider<ArmInstance>(),
    key: ""
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const positions: Vec3[] = [];
    const weight1s: Vec3[] = [];
    const weight2s: Vec3[] = [];

    // Fill positions
    const segments1 = 10;
    const segments2 = 20;

    for (let i = 0; i < segments1; i++) {
      for (let j = 0; j < segments2; j++) {
        const angle1 = i * Math.PI * 2 / segments1;
        const angle2 = (i + 1) * Math.PI * 2 / segments1;
        const c1 = Math.cos(angle1);
        const s1 = Math.sin(angle1);
        const c2 = Math.cos(angle2);
        const s2 = Math.sin(angle2);
        const b = j / segments2;
        const t = (j + 1) / segments2;
        const bl: Vec3 = [c1, b, s1];
        const br: Vec3 = [c2, b, s2];
        const tl: Vec3 = [c1, t, s1];
        const tr: Vec3 = [c2, t, s2];

        // triangle1: bl -> br -> tl
        positions.push(bl);
        positions.push(br);
        positions.push(tl);

        // triangle2: br -> tr -> tl
        positions.push(br);
        positions.push(tr);
        positions.push(tl);
      }
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require("./arm-layer.fs"),
      instanceAttributes: [
        createAttribute({
          name: "s",
          size: InstanceAttributeSize.THREE,
          update: o => o.scale
        }),
        createAttribute({
          name: "r1",
          size: InstanceAttributeSize.FOUR,
          update: o => o.quat1
        }),
        createAttribute({
          name: "r2",
          size: InstanceAttributeSize.FOUR,
          update: o => o.quat2
        }),
        createAttribute({
          name: "t",
          size: InstanceAttributeSize.THREE,
          update: () => [0, 0, 0]
        }),
        createAttribute({
          name: "radius",
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius]
        }),
        createAttribute({
          name: "leng1",
          size: InstanceAttributeSize.ONE,
          update: o => [o.length1]
        }),
        createAttribute({
          name: "leng2",
          size: InstanceAttributeSize.ONE,
          update: o => [o.length2]
        }),
        createAttribute({
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        })
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => positions[vertex]
        }
      ],
      vertexCount: segments1 * segments2 * 6,
      vs: require("./arm-layer.vs")
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentImageBlending, {
      cullSide: GLSettings.Material.CullSide.BOTH
    });
  }
}
