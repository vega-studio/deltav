import { IMaterialOptions } from "../types";

export class CommonMaterialOptions {
  static transparentShape: IMaterialOptions = {
    premultipliedAlpha: false,
    transparent: true
  };

  static transparentImage: IMaterialOptions = {
    blending: Three.CustomBlending,
    blendSrc: Three.OneFactor,
    premultipliedAlpha: true,
    transparent: true
  };
}
