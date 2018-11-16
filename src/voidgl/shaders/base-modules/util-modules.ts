import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "no-op",
    content: require("./shader-fragments/no-op.vs"),
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    moduleId: "no-op",
    content: require("./shader-fragments/no-op.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  }
]);
