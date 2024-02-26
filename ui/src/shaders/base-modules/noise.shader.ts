import SimplexNoise2DFS from "./shader-fragments/simplex-noise-2d.fs";
import SimplexNoise3DFS from "./shader-fragments/simplex-noise-3d.fs";
import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register({
  moduleId: "simplexNoise3D",
  content: SimplexNoise3DFS,
  compatibility: ShaderInjectionTarget.ALL,
  description: "Provides the simplex noise function for 3D coordinates.",
});

ShaderModule.register({
  moduleId: "simplexNoise2D",
  content: SimplexNoise2DFS,
  compatibility: ShaderInjectionTarget.ALL,
  description: "Provides the simplex noise function for 2D coordinates.",
});
