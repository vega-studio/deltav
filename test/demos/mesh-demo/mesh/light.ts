import { Vec3, Vec4 } from "../../../../src";

export enum LightType {
  DIRECTION = 0,
  POINT = 1
}

export interface ILightOptions {
  type?: LightType;
  position?: Vec3;
  ambientColor?: Vec4;
  diffuseColor?: Vec4;
  specularColor?: Vec4;
}
export class Light {
  type: LightType = LightType.POINT;
  position: Vec3 = [0.0, 0.0, 0.0];
  ambientColor: Vec4 = [1.0, 1.0, 1.0, 1.0];
  diffuseColor: Vec4 = [1.0, 1.0, 1.0, 1.0];
  specularColor: Vec4 = [1.0, 1.0, 1.0, 1.0];

  constructor(options?: ILightOptions) {
    if (options) {
      this.type = options.type || this.type;
      this.position = options.position || this.position;
      this.ambientColor = options.ambientColor || this.ambientColor;
      this.diffuseColor = options.diffuseColor || this.diffuseColor;
      this.specularColor = options.specularColor || this.specularColor;
    }
  }
}
