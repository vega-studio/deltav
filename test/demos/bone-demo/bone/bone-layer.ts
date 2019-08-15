import {
  CommonMaterialOptions,
  createAttribute,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec2,
  Vec3,
  VertexAttributeSize
} from "../../../../src";
import { BoneInstance } from "./bone-instance";

/*function getRotation(bone: BoneInstance) {
  let rotationMatrix = matrix4x4FromUnitQuatModel(bone.transform.rotation);
  let parent = bone.parent;

  while (parent) {
    const parentMatrix = matrix4x4FromUnitQuatModel(parent.transform.rotation);
    rotationMatrix = multiply4x4(parentMatrix, rotationMatrix);
    parent = parent.parent;
  }
  const result = matrix4x4ToQuaternion(rotationMatrix);
  console.warn(rotationMatrix);
  return result;
}

function getOrigin(bone: BoneInstance) {
  const bones = [];

  // let rotationMatrix = matrix4x4FromUnitQuatModel(bone.transform.rotation);
  bones.push(bone);
  let parent = bone.parent;

  while (parent) {
    // rotationMatrix = matrix4x4FromUnitQuatModel(parent.transform.rotation);
    bones.push(parent);
    parent = parent.parent;
  }

  let origin: Vec3 = [0, 0, 0];
  let top: Vec3 = [0, 0, 0];
  let rotation = identity4();

  let hasTop = false;

  while (bones.length > 0) {
    const curBone = bones.pop();

    if (curBone) {
      if (hasTop) {
        origin = top;
        rotation = multiply4x4(
          matrix4x4FromUnitQuatModel(curBone.transform.rotation),
          rotation
        );
      } else {
        origin = curBone.origin;
        rotation = matrix4x4FromUnitQuatModel(curBone.transform.rotation);
      }
      const t = transform4(rotation, [0, curBone.length, 0, 1]);
      top = add3(origin, [t[0], t[1], t[2]]);
      hasTop = true;
    }
  }

  // console.warn(bone.color, origin);

  return origin;
}*/

export interface IBoneLayerProps<TInstance extends BoneInstance>
  extends ILayerProps<TInstance> {}

export class BoneLayer<
  TInstance extends BoneInstance,
  TProps extends IBoneLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: IBoneLayerProps<BoneInstance> = {
    data: new InstanceProvider<BoneInstance>(),
    key: ""
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const segments = 10;
    const positions: Vec3[] = [];
    const normals: Vec3[] = [];
    const tex: Vec2[] = [];

    for (let i = 0; i < segments; i++) {
      const angle1 = i * Math.PI * 2 / segments;
      const angle2 = (i + 1) * Math.PI * 2 / segments;
      const LB: Vec3 = [Math.cos(angle1), 0, Math.sin(angle1)];
      const RB: Vec3 = [Math.cos(angle2), 0, Math.sin(angle2)];
      const LT: Vec3 = [Math.cos(angle1), 1, Math.sin(angle1)];
      const RT: Vec3 = [Math.cos(angle2), 1, Math.sin(angle2)];

      positions.push(LB);
      normals.push(LB);
      tex.push([0, 0]);

      positions.push(RB);
      normals.push(RB);
      tex.push([1, 0]);

      positions.push(LT);
      normals.push(LB);
      tex.push([0, 1]);

      positions.push(RB);
      normals.push(RB);
      tex.push([1, 0]);

      positions.push(RT);
      normals.push(RB);
      tex.push([1, 1]);

      positions.push(LT);
      normals.push(LB);
      tex.push([0, 1]);
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require("./bone-layer.fs"),
      instanceAttributes: [
        createAttribute({
          name: "s",
          size: InstanceAttributeSize.THREE,
          update: o => o.scale
        }),
        createAttribute({
          name: "origin",
          size: InstanceAttributeSize.THREE,
          update: o => o.origin
        }),
        createAttribute({
          name: "r",
          size: InstanceAttributeSize.FOUR,
          update: o => o.quat
        }),
        createAttribute({
          name: "t",
          size: InstanceAttributeSize.THREE,
          update: o => o.origin
        }),

        createAttribute({
          name: "radius",
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius]
        }),
        createAttribute({
          name: "len",
          size: InstanceAttributeSize.ONE,
          update: o => [o.length]
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
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => normals[vertex]
        },
        {
          name: "texCoord",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex]
        }
      ],
      vertexCount: segments * 6,
      vs: require("./bone-layer.vs")
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.BOTH
    });
  }
}
