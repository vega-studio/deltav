import {
  ShaderInjectionTarget,
  UniformSize
} from "../../types";
import { ShaderModule } from "../processing";

const doc = `
Provides a constant that is populated
with a random value 0 - 1.
This value is static for each draw call,
but changes every draw call.

float random;
`;

ShaderModule.register([
  {
    moduleId: "random",
    description: doc,
    content: '',
    compatibility: ShaderInjectionTarget.ALL,

    uniforms: _layer => [
      {
        name: 'random',
        size: UniformSize.ONE,
        update: () => Math.random(),
      }
    ]
  }
]);
