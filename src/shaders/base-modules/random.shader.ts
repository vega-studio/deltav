import {
  ShaderInjectionTarget,
  UniformSize
} from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "random",
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
