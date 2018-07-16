import { IInstanceAttribute } from '../../types';
import { Instance } from '../../util';

export function instanceAttributeShaderName<T extends Instance>(attribute: IInstanceAttribute<T>) {
  if (attribute.easing) {
    return `_${attribute.name}_end`;
  }

  else {
    return attribute.name;
  }
}
