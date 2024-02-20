import arc from "./shader-fragments/arc.vs";
import bezier1 from "./shader-fragments/bezier1.vs";
import bezier2 from "./shader-fragments/bezier2.vs";
import fcos from "./shader-fragments/fcos.vs";
import fmod from "./shader-fragments/fmod.vs";
import fsin from "./shader-fragments/fsin.vs";
import PI from "./shader-fragments/constants/pi.vs";
import PI2 from "./shader-fragments/constants/pi2.vs";
import PI2_INV from "./shader-fragments/constants/pi2_inv.vs";
import PI_2 from "./shader-fragments/constants/pi_2.vs";
import PI_4 from "./shader-fragments/constants/pi_4.vs";
import PI_INV from "./shader-fragments/constants/pi_inv.vs";
import toDegrees from "./shader-fragments/constants/to-degrees.vs";
import toRadians from "./shader-fragments/constants/to-radians.vs";
import wrap from "./shader-fragments/wrap.vs";
import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

// All of the constants fragments
const constants = [
  {
    moduleId: "PI_INV",
    description: "Provides: float PI_INV = 1.0 / pi",
    content: PI_INV,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "PI2_INV",
    description: "Provides:\nfloat PI2_INV = 1.0 / (pi * 2.0)",
    content: PI2_INV,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "PI_2",
    description: "Provides: float PI_2 = pi / 2.0",
    content: PI_2,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "PI_4",
    description: "Provides: float PI_4 = pi / 4.0",
    content: PI_4,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "PI",
    description: "Provides: float PI = pi",
    content: PI,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "PI2",
    description: "Provides: float PI2 = pi * 2.0",
    content: PI2,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "toDegrees",
    description:
      "Provides: float toDegrees;\nCan be used to convert radians to degrees:\nradians * toDegrees",
    content: toDegrees,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "toRadians",
    description:
      "Provides: float toRadians;\nCan be used to convert degrees to radians:\ndegress * toRadians",
    content: toRadians,
    compatibility: ShaderInjectionTarget.ALL,
  },
];

const doc = `
Provides all the math constants you may
need as convenience. It's probably
better to include them individually, but
convenience sometimes beats practicality

Constants:
${constants.map((c) => c.moduleId).join("\n")}
`;

// A bin import that let's you add all common constants to your shader
const allConstants = {
  moduleId: "constants",
  description: doc,
  content: `$\{import: ${constants.map((c) => c.moduleId).join(", ")}}`,
  compatibility: ShaderInjectionTarget.ALL,
};

// All of the mathematical methods
const methods = [
  {
    moduleId: "bezier1",
    description:
      "Provides the 2D single control\npoint bezier method:\nvec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1)",
    content: bezier1,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "bezier2",
    description:
      "Provides the 2D single control\npoint bezier method:\nvec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)",
    content: bezier2,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "arc",
    description:
      "Provides the 2D\narc interpolation method:\nvec2 arc(float t,\n\tvec2 center,\n\tfloat radius,\n\tfloat start,\n\tfloat end\n)",
    content: arc,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "fmod",
    description:
      "Provides the floating point\nmodulus method:\nfloat fmod(float x, float m, float m_inv)",
    content: fmod,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "wrap",
    description:
      "Provides a method that wraps\nvalue overflows:\nfloat wrap(float value, float start, float end)",
    content: wrap,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "fcos",
    description:
      "Provides a fcos method that also\nhas a higher precision than\nsome hardware cos implementations:\nfloat fcos(float x)",
    content: fcos,
    compatibility: ShaderInjectionTarget.ALL,
  },
  {
    moduleId: "fsin",
    description:
      "Provides a fsin method that also\nhas a higher precision than\nsome hardware sin implementations:\nfloat fsin(float x)",
    content: fsin,
    compatibility: ShaderInjectionTarget.ALL,
  },
];

// Register all modules
ShaderModule.register([...methods, ...constants, allConstants]);
