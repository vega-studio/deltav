import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "translation",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/translation.vs")
  },
  {
    moduleId: "rotation",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/rotation.vs")
  },
  {
    moduleId: "scale",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/scale.vs")
  },
  {
    moduleId: "transform",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/transform.vs")
  }
]);
