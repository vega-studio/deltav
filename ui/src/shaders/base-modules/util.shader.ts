import noopFS from "./shader-fragments/no-op.fs";
import noopVS from "./shader-fragments/no-op.vs";
import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

const doc = `
Makes a no-op shader where gl_Position
is [0, 0, 0, 0] and gl_FragColor is
[0, 0, 0, 0].

You can not import this if you specify
your own main() method.
`;

ShaderModule.register([
  {
    moduleId: "no-op",
    description: doc,
    content: noopVS,
    compatibility: ShaderInjectionTarget.VERTEX,
  },
  {
    moduleId: "no-op",
    description: doc,
    content: noopFS,
    compatibility: ShaderInjectionTarget.FRAGMENT,
  },
]);
