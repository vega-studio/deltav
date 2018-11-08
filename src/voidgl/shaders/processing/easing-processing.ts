import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, InstanceAttributeSize } from "../../types";
import {
  IShaderTemplateRequirements,
  shaderTemplate
} from "../../util/shader-templating";
import { templateVars } from "../template-vars";

/** Converts a size to a shader type */
const sizeToType: { [key: number]: string } = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  99: "sampler2D"
};

/**
 * This processor deals with how easing and AutoEasingMethods work with the shaders.
 */
export class EasingProcessing {
  /**
   * This generates the methods needed from all of the auto easing methods and makes them
   * injectable into our shader.
   */
  process<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[]) {
    const methods = new Map<string, Map<InstanceAttributeSize, string>>();
    let out = "// Auto Easing Methods specified by the layer\n";

    // First dedupe the methods needed by their method name
    instanceAttributes.forEach(attribute => {
      if (attribute.easing && attribute.size) {
        let methodSizes = methods.get(attribute.easing.methodName);

        if (!methodSizes) {
          methodSizes = new Map<InstanceAttributeSize, string>();
          methods.set(attribute.easing.methodName, methodSizes);
        }

        methodSizes.set(attribute.size, attribute.easing.gpu);
      }
    });

    if (methods.size === 0) {
      return "";
    }

    const required: IShaderTemplateRequirements = {
      name: "Easing Method Generation",
      values: [templateVars.easingMethod]
    };

    // Now generate the full blown method for each element. We create overloaded methods for
    // Each method name for each vector size required
    methods.forEach(
      (methodSizes: Map<InstanceAttributeSize, string>, methodName: string) => {
        methodSizes.forEach((method, size) => {
          const sizeType = sizeToType[size];

          const templateOptions: { [key: string]: string } = {
            [templateVars.easingMethod]: `${sizeType} ${methodName}(${sizeType} start, ${sizeType} end, float t)`,
            [templateVars.T]: `${sizeType}`
          };

          const results = shaderTemplate({
            options: templateOptions,
            required,
            shader: method
          });

          out += `${results.shader}\n`;
        });
      }
    );

    return out;
  }
}
