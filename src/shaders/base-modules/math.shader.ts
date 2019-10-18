import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

// All of the constants fragments
const constants = [
  {
    moduleId: "PI_INV",
    content: require("./shader-fragments/constants/pi_inv.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI2_INV",
    content: require("./shader-fragments/constants/pi2_inv.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI_2",
    content: require("./shader-fragments/constants/pi_2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI_4",
    content: require("./shader-fragments/constants/pi_4.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI",
    content: require("./shader-fragments/constants/pi.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI2",
    content: require("./shader-fragments/constants/pi2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "toDegrees",
    content: require("./shader-fragments/constants/to-degrees.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "toRadians",
    content: require("./shader-fragments/constants/to-radians.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
];

// A bin import that let's you add all common constants to your shader
const allConstants = {
  moduleId: "constants",
  content: `$\{import: ${constants.map(c => c.moduleId).join(", ")}}`,
  compatibility: ShaderInjectionTarget.ALL
};

// All of the mathematical methods
const methods = [
  {
    moduleId: "bezier1",
    content: require("./shader-fragments/bezier1.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "bezier2",
    content: require("./shader-fragments/bezier2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "arc",
    content: require("./shader-fragments/arc.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fmod",
    content: require("./shader-fragments/fmod.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "wrap",
    content: require("./shader-fragments/wrap.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fcos",
    content: require("./shader-fragments/fcos.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fsin",
    content: require("./shader-fragments/fsin.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
];

// Register all modules
ShaderModule.register([...methods, ...constants, allConstants]);
