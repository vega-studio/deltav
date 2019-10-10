import { ShaderInjectionTarget } from '../../types';
import { ShaderModule } from '../processing';

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register({
  moduleId: 'hsv',
  content: require('./shader-fragments/hsv.vs'),
  compatibility: ShaderInjectionTarget.ALL,
});
