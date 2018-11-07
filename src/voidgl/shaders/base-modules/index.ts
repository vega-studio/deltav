import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "no-op",
    content: require("./no-op.vs"),
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    moduleId: "no-op",
    content: require("./no-op.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    moduleId: "projection",
    content: require("./projection.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "picking",
    content: require("./picking.vs"),
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    moduleId: "picking",
    content: require("./picking.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    moduleId: "no-picking",
    content: require("./no-picking.vs"),
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    moduleId: "no-picking",
    content: require("./no-picking.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  }
]);
