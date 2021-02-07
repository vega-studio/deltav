import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

// All of the constants fragments
const constants = [
  {
    moduleId: "PI_INV",
    description: "Provides: float PI_INV = 1.0 / pi",
    content: require("./shader-fragments/constants/pi_inv.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI2_INV",
    description: "Provides:\nfloat PI2_INV = 1.0 / (pi * 2.0)",
    content: require("./shader-fragments/constants/pi2_inv.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI_2",
    description: "Provides: float PI_2 = pi / 2.0",
    content: require("./shader-fragments/constants/pi_2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI_4",
    description: "Provides: float PI_4 = pi / 4.0",
    content: require("./shader-fragments/constants/pi_4.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI",
    description: "Provides: float PI = pi",
    content: require("./shader-fragments/constants/pi.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "PI2",
    description: "Provides: float PI2 = pi * 2.0",
    content: require("./shader-fragments/constants/pi2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "toDegrees",
    description:
      "Provides: float toDegrees;\nCan be used to convert radians to degrees:\nradians * toDegrees",
    content: require("./shader-fragments/constants/to-degrees.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "toRadians",
    description:
      "Provides: float toRadians;\nCan be used to convert degrees to radians:\ndegress * toRadians",
    content: require("./shader-fragments/constants/to-radians.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
];

const doc = `
Provides all the math constants you may
need as convenience. It's probably
better to include them individually, but
convenience sometimes beats practicality

Constants:
${constants.map(c => c.moduleId).join("\n")}
`;

// A bin import that let's you add all common constants to your shader
const allConstants = {
  moduleId: "constants",
  description: doc,
  content: `$\{import: ${constants.map(c => c.moduleId).join(", ")}}`,
  compatibility: ShaderInjectionTarget.ALL
};

// All of the mathematical methods
const methods = [
  {
    moduleId: "bezier1",
    description:
      "Provides the 2D single control\npoint bezier method:\nvec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1)",
    content: require("./shader-fragments/bezier1.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "bezier2",
    description:
      "Provides the 2D single control\npoint bezier method:\nvec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)",
    content: require("./shader-fragments/bezier2.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "arc",
    description:
      "Provides the 2D\narc interpolation method:\nvec2 arc(float t,\n\tvec2 center,\n\tfloat radius,\n\tfloat start,\n\tfloat end\n)",
    content: require("./shader-fragments/arc.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fmod",
    description:
      "Provides the floating point\nmodulus method:\nfloat fmod(float x, float m, float m_inv)",
    content: require("./shader-fragments/fmod.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "wrap",
    description:
      "Provides a method that wraps\nvalue overflows:\nfloat wrap(float value, float start, float end)",
    content: require("./shader-fragments/wrap.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fcos",
    description:
      "Provides a fcos method that also\nhas a higher precision than\nsome hardware cos implementations:\nfloat fcos(float x)",
    content: require("./shader-fragments/fcos.vs"),
    compatibility: ShaderInjectionTarget.ALL
  },
  {
    moduleId: "fsin",
    description:
      "Provides a fsin method that also\nhas a higher precision than\nsome hardware sin implementations:\nfloat fsin(float x)",
    content: require("./shader-fragments/fsin.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
];

// Register all modules
ShaderModule.register([...methods, ...constants, allConstants]);
