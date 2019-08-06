import {
  add3,
  IInstance3DOptions,
  Instance3D,
  matrix4x4FromUnitQuatModel,
  matrix4x4FromUnitQuatView,
  matrix4x4ToQuaternion,
  multiply4x4,
  observable,
  transform4,
  Vec3,
  Vec4
} from "../../../../src";

export interface IBoneOptions extends IInstance3DOptions {
  color?: Vec4;
}

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
}*/

export class BoneInstance extends Instance3D {
  @observable color: Vec4 = [0.9, 0.56, 0.2, 1];
  @observable weight: number = 1;
  @observable length: number = 3;
  @observable radius: number = 0.3;

  @observable quat: Vec4 = [1, 0, 0, 0];
  @observable origin: Vec3 = [0, 0, 0];

  top: Vec3 = [0, 0, 0];
  children: BoneInstance[] = [];
  parent?: BoneInstance;

  constructor(options: IBoneOptions) {
    super(options);
    this.color = options.color || this.color;
    this.quat = this.transform.rotation;

    const rotationMatrix = matrix4x4FromUnitQuatModel(this.quat);
    const t = transform4(rotationMatrix, [0, this.length, 0, 1]);

    this.top = add3(this.origin, [t[0], t[1], t[2]]);
  }

  setRotation(q: Vec4) {
    this.transform.rotation = q;

    if (this.parent) {
      const parentMatrix = matrix4x4FromUnitQuatView(this.parent.quat);
      const childMatrix = matrix4x4FromUnitQuatView(q);
      const result = multiply4x4(childMatrix, parentMatrix);
      this.quat = matrix4x4ToQuaternion(result);

      const rotationMatrix = matrix4x4FromUnitQuatModel(this.quat);
      const t = transform4(rotationMatrix, [0, this.length, 0, 1]);
      this.top = add3(this.origin, [t[0], t[1], t[2]]);
    } else {
      this.quat = q;
      const rotationMatrix = matrix4x4FromUnitQuatModel(this.quat);
      const t = transform4(rotationMatrix, [0, this.length, 0, 1]);
      this.top = add3(this.origin, [t[0], t[1], t[2]]);
    }

    const queue = [];
    queue.push(this);

    while (queue.length > 0) {
      const len = queue.length;

      for (let i = 0; i < len; i++) {
        const child = queue.shift();
        if (child) {
          const parentMatrix = matrix4x4FromUnitQuatView(child.quat);

          child.children.forEach(c => {
            c.origin = child.top;

            const childMatrix = matrix4x4FromUnitQuatView(c.transform.rotation);
            const result = multiply4x4(childMatrix, parentMatrix);
            c.quat = matrix4x4ToQuaternion(result);

            const rotationMatrix = matrix4x4FromUnitQuatModel(c.quat);
            const t = transform4(rotationMatrix, [0, this.length, 0, 1]);
            c.top = add3(c.origin, [t[0], t[1], t[2]]);

            queue.push(c);
          });
        }
      }
    }
  }

  addChild(child: BoneInstance) {
    this.children.push(child);
    child.parent = this;

    child.origin = this.top;
    const parentMatrix = matrix4x4FromUnitQuatView(this.quat);

    const queue = [];
    queue.push(child);

    while (queue.length > 0) {
      const len = queue.length;

      for (let i = 0; i < len; i++) {
        const child = queue.shift();

        if (child) {
          const childMatrix = matrix4x4FromUnitQuatView(child.quat);
          const result = multiply4x4(childMatrix, parentMatrix);
          child.quat = matrix4x4ToQuaternion(result);

          const rotationMatrix = matrix4x4FromUnitQuatModel(child.quat);
          const t = transform4(rotationMatrix, [0, this.length, 0, 1]);
          child.top = add3(child.origin, [t[0], t[1], t[2]]);

          child.children.forEach(c => {
            c.origin = child.top;
            queue.push(c);
          });
        }
      }
    }
  }
}
