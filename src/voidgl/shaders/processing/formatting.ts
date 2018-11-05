import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute } from "../../types";

export function getAttributeShaderName<T extends Instance>(
  attribute: IInstanceAttribute<T>
) {
  if (attribute.easing) {
    return `_${attribute.name}_end`;
  } else {
    return attribute.name;
  }
}
