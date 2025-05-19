import { ShaderInjectionTarget } from "../../types.js";
import { ShaderModule } from "../processing";
import rotation from "./shader-fragments/matrix/rotation.vs";
import scale from "./shader-fragments/matrix/scale.vs";
import transform from "./shader-fragments/matrix/transform.vs";
import translation from "./shader-fragments/matrix/translation.vs";

ShaderModule.register([
  {
    moduleId: "translation",
    description:
      "Generates a translation matrix\nfrom a vec3:\nmat4 transform(vec3 s, vec4 r, vec3 t)",
    compatibility: ShaderInjectionTarget.ALL,
    content: translation,
  },
  {
    moduleId: "rotation",
    description:
      "Generates a rotation matrix\nfrom a quaternion:\nmat4 rotationFromQuaternion(vec4 q)",
    compatibility: ShaderInjectionTarget.ALL,
    content: rotation,
  },
  {
    moduleId: "scale",
    description: "Generates a scale matrix\nfrom a vec3:\nmat4 scale(vec3 s)",
    compatibility: ShaderInjectionTarget.ALL,
    content: scale,
  },
  {
    moduleId: "transform",
    description:
      "Generates a full transform matrix\nfrom a scale, quaternion, translation:\nmat4 transform(vec3 s, vec4 r, vec3 t)",
    compatibility: ShaderInjectionTarget.ALL,
    content: transform,
  },
]);
