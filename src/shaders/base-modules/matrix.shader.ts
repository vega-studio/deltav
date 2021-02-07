import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "translation",
    description:
      "Generates a translation matrix\nfrom a vec3:\nmat4 transform(vec3 s, vec4 r, vec3 t)",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/translation.vs")
  },
  {
    moduleId: "rotation",
    description:
      "Generates a rotation matrix\nfrom a quaternion:\nmat4 rotationFromQuaternion(vec4 q)",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/rotation.vs")
  },
  {
    moduleId: "scale",
    description: "Generates a scale matrix\nfrom a vec3:\nmat4 scale(vec3 s)",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/scale.vs")
  },
  {
    moduleId: "transform",
    description:
      "Generates a full transform matrix\nfrom a scale, quaternion, translation:\nmat4 transform(vec3 s, vec4 r, vec3 t)",
    compatibility: ShaderInjectionTarget.ALL,
    content: require("./shader-fragments/matrix/transform.vs")
  }
]);
