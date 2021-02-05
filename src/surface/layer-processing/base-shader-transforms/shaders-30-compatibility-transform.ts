import { WebGLStat } from "../../../gl/webgl-stat";
import { BaseShaderTransform } from "../../../shaders/processing/base-shader-transform";
import { removeComments } from "../../../util/remove-comments";

/**
 * This transform is a last pass to resolve odds and ends differences that can
 * slip in from the way a shader is written. This will attempt it's best to
 * resolve a shader into the proper shader version that is appropriate for the
 * current hardware.
 */
export class Shaders30CompatibilityTransform extends BaseShaderTransform {
  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to outs.
   *   - texture2D sampling is now texture
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure out's are changed to varying
   */
  vertex(shader: string): string {
    // Clearing out the comments removes a plethora of inherent issues
    let out = removeComments(shader);

    if (WebGLStat.SHADERS_3_0) {
      out = out.replace(/\s+varying\s+/g, "\nout ");
      out = out.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture(");
    } else {
      out = out.replace(/^#version 300 es/g, "");
      out = out.replace(/\s+out\s+/g, "\nvarying ");
    }

    return out;
  }

  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to in's.
   *   - if gl_FragColor is present, we need to generate an out for it
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure in's are changed to varying
   */
  fragment(shader: string): string {
    // Clearing out the comments removes a plethora of inherent issues
    let out = removeComments(shader);

    if (WebGLStat.SHADERS_3_0) {
      out = out.replace(/\s+varying\s+/g, "\nin ");
      out = out.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture(");

      if (out.match(/gl_FragColor/g)) {
        out = out.replace(/gl_FragColor/g, "_FragColor");
        const elements = out.split("\n");
        elements.splice(3, 0, "layout(location = 0) out vec4 _FragColor;");
        out = elements.join("\n");
      }
    } else {
      out = out.replace(/^#version 300 es/g, "");
      out = out.replace(/\s+in\s+/g, "\nvarying ");
    }

    return out;
  }
}
