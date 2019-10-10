import { Layer } from '../../surface/layer';
import { ShaderInjectionTarget, UniformSize } from '../../types';
import { ShaderModule } from '../processing';

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register({
  moduleId: 'frame',
  content: '',
  compatibility: ShaderInjectionTarget.ALL,
  uniforms: (layer: Layer<any, any>) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: 'currentTime',
      size: UniformSize.ONE,
      update: () => [layer.surface.frameMetrics.currentTime],
    },
    {
      name: 'currentFrame',
      size: UniformSize.ONE,
      update: () => [layer.surface.frameMetrics.currentFrame],
    },
  ],
});
