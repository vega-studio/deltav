import { GLSettings } from "../gl/gl-settings.js";
import { ILayerMaterialOptions } from "../types.js";

export type CommonMaterial = ILayerMaterialOptions & {
  modify(options: ILayerMaterialOptions): Omit<CommonMaterial, "modify>">;
};

/**
 * These are material options you may commonly see for handling various scenarios.
 */
export class CommonMaterialOptions {
  /**
   * Sets up blending for transparent shapes.
   * Removes need for gl_FragColor.rgb *= gl_FragColor.a in shader.
   */
  static transparentShapeBlending: CommonMaterial = {
    blending: {
      blendDst: GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: GLSettings.Material.BlendingEquations.Add,
      blendSrc: GLSettings.Material.BlendingSrcFactor.SrcAlpha,
    },
    culling: GLSettings.Material.CullSide.NONE,

    modify(options: ILayerMaterialOptions) {
      return Object.assign({}, this, options);
    },
  };

  /**
   * Sets up blending for transparent images. This requires the image to be premultipled alpha.
   * Removes need for texel.rgb *= texel.a; as it assumes the value is premultiplied.
   */
  static transparentImageBlending: CommonMaterial = {
    blending: {
      blendSrc: GLSettings.Material.BlendingSrcFactor.One,
      blendDst: GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: GLSettings.Material.BlendingEquations.Add,
    },
    culling: GLSettings.Material.CullSide.NONE,

    modify(options: ILayerMaterialOptions) {
      return Object.assign({}, this, options);
    },
  };
}
