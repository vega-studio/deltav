import { ShaderInjectionTarget } from "../../types.js";
import { ShaderModule } from "../processing";
import packFloat from "./shader-fragments/pack-float.vs";

const doc = `
This provides the ability to pack
a float value into a color RGBA
value. This is used to bypass the
lack of support for float textures.

Constants:
float currentTime;
float currentFrame;
`;

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register({
  moduleId: "packFloat",
  description: doc,
  content: packFloat,
  compatibility: ShaderInjectionTarget.ALL,
});
