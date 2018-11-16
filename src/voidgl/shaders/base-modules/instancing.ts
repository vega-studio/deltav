import { LayerBufferType } from "../../surface/layer-processing/layer-buffer-type";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  ShaderInjectionTarget,
  VertexAttributeSize
} from "../../types";
import { Instance } from "../../util";
import { ShaderModule } from "../processing";

/**
 * This module contains the basic needs required to facilitate instancing for our shaders
 */
ShaderModule.register({
  moduleId: "instancing",
  content: "",
  compatibility: ShaderInjectionTarget.ALL,

  instanceAttributes: layer => {
    // This is injected so the system can control when an instance should not be rendered.
    // This allows for holes to be in the buffer without having to correct them immediately
    const activeAttribute: IInstanceAttribute<Instance> = {
      name: "_active",
      size: InstanceAttributeSize.ONE,
      update: o => [o.active ? 1 : 0]
    };

    // Set the active attribute to the layer for quick reference
    layer.activeAttribute = activeAttribute;

    return [activeAttribute];
  },

  vertexAttributes: layer => {
    // Only the uniform buffering strategy requires instance information in it's vertex attributes
    if (layer.bufferType === LayerBufferType.UNIFORM) {
      return [
        // We add an inherent instance attribute to our vertices so they can determine the instancing
        // Data to retrieve.
        {
          name: "instance",
          size: VertexAttributeSize.ONE,
          // We no op this as our geometry generating routine will establish the values needed here
          update: () => [0]
        }
      ];
    }

    return [];
  }
});
