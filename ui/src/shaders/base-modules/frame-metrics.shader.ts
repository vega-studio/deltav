import { Layer } from "../../surface/layer.js";
import { ShaderInjectionTarget, UniformSize } from "../../types.js";
import { ShaderModule } from "../processing";

const doc = `
This provides frame timing information
or how many frames have been rendered.

Constants:
float currentTime;
float currentFrame;
`;

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register({
  moduleId: "frame",
  description: doc,
  content: "",
  compatibility: ShaderInjectionTarget.ALL,
  uniforms: (layer: Layer<any, any>) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "currentTime",
      size: UniformSize.ONE,
      shaderInjection: ShaderInjectionTarget.ALL,
      update: () => [layer.surface.frameMetrics.currentTime],
    },
    {
      name: "currentFrame",
      size: UniformSize.ONE,
      shaderInjection: ShaderInjectionTarget.ALL,
      update: () => [layer.surface.frameMetrics.currentFrame],
    },
  ],
});

ShaderModule.register({
  moduleId: "time",
  description: doc,
  content: "",
  compatibility: ShaderInjectionTarget.ALL,
  uniforms: (layer: Layer<any, any>) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "time",
      size: UniformSize.ONE,
      shaderInjection: ShaderInjectionTarget.ALL,
      update: () => [layer.surface.frameMetrics.currentTime],
    },
  ],
});
