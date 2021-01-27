import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

const doc = `
Provides methods that converts colors to
HSV values and back. This makes it
easier to deal with hue saturation and
lightness levels.

Methods:
vec3 rgb2hsv(vec3 c);
vec3 hsv2rgb(vec3 c);
`;

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register({
  moduleId: "hsv",
  description: doc,
  content: require("./shader-fragments/hsv.vs"),
  compatibility: ShaderInjectionTarget.ALL
});
