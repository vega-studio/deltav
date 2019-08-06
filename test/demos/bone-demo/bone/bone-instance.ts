import {
  IInstance3DOptions,
  Instance3D,
  matrix4x4FromUnitQuatModel,
  matrix4x4ToQuaternion,
  multiply4x4,
  observable,
  Vec4
} from "../../../../src";

export interface IBoneOptions extends IInstance3DOptions {
  color?: Vec4;
}

function getRotation(bone: BoneInstance) {
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

export class BoneInstance extends Instance3D {
  @observable color: Vec4 = [0.9, 0.56, 0.2, 1];
  weight: number = 1;
  @observable origin: Vec4 = [0, 0, 0, 1];
  @observable length: number = 3;
  @observable radius: number = 0.3;

  @observable quat: Vec4 = [1, 0, 0, 0];
  children: BoneInstance[] = [];
  parent?: BoneInstance;

  constructor(options: IBoneOptions) {
    super(options);
    this.color = options.color || this.color;
    this.quat = this.transform.rotation;
  }

  addChild(child: BoneInstance) {
    this.children.push(child);
    child.parent = this;

    const parentMatrix = matrix4x4FromUnitQuatModel(this.quat);

    const queue = [];
    queue.push(child);

    while (queue.length > 0) {
      const child = queue.shift();
      if (child) {
        const childMatrix = matrix4x4FromUnitQuatModel(child.quat);
        const result = multiply4x4(parentMatrix, childMatrix);
        child.quat = matrix4x4ToQuaternion(result);

        child.children.forEach(child => queue.push(child));
      }
    }
  }
}
