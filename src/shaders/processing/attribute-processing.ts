import { MaterialUniformType } from "src/gl/types";
import {
  BaseShaderIOInjection,
  ShaderIOHeaderInjectionResult
} from "src/shaders/processing/base-shader-io-injection";
import { Vec4 } from "src/util/vector";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { LayerBufferType } from "../../surface/layer-processing/layer-buffer-type";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  IUniform,
  IVertexAttribute,
  PickType,
  ResourceType
} from "../../types";
import { AutoEasingLoopStyle } from "../../util/auto-easing-method";
import { getAttributeShaderName } from "./formatting";
import { MetricsProcessing } from "./metrics-processing";
import { UniformProcessing } from "./uniform-processing";

/** Defines the elements for destructuring out of a vector */
const VECTOR_COMPONENTS = ["x", "y", "z", "w"];

/** Converts a size to a shader type */
const sizeToType: { [key: number]: string } = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  /** This is the special case for instance attributes that want an atlas resource */
  99: "vec4"
};

/**
 * This sorts attributes specific to how they need to be destructured. For example:
 * easing attributes MUST appear AFTER all of the specially integrated attributes that were generated
 * such as start times and durations.
 */
function orderByPriority(
  a: IInstanceAttribute<any>,
  b: IInstanceAttribute<any>
) {
  if (a.easing && !b.easing) return 1;
  return -1;
}

/**
 * This method properly provides a vector's chunk of data based on a swizzle. So a size of 2
 * provides vector.xy and a size of 4 provides vector.xyzw.
 */
function makeVectorSwizzle(start: number, size: number) {
  return VECTOR_COMPONENTS.slice(start, start + size).join("");
}

/**
 * This object is responsible for generating how attributes are declared as input to the shader.
 */
export class AttributeProcessing extends BaseShaderIOInjection {
  /**
   * This processes the layer and it's attributes to generate a Destructuring chunk that guarantees the attributes
   * and special properties with the attributes are available based on the instance attributes names provided
   * by the layer.
   *
   * IE- this guarantees an attribute with auto easing linear to be available by name AND it's value will be properly
   * populated with a linearly eased value based on the system time.
   */
  processAttributeDestructuring(
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): string {
    let out = "";

    // Order the attributes such that the easing attributes come last so the needed
    // info for the easing attribute can be in place
    const orderedAttributes = instanceAttributes.slice(0).sort(orderByPriority);

    // See which buffer strategy our layer is using and produce a destructuring strategy that suits it
    switch (layer.bufferType) {
      case LayerBufferType.INSTANCE_ATTRIBUTE:
        out = this.processDestructuringInstanceAttribute(orderedAttributes);
        break;

      case LayerBufferType.INSTANCE_ATTRIBUTE_PACKING:
        out = this.processDestructuringInstanceAttributePacking(
          orderedAttributes
        );
        break;

      case LayerBufferType.UNIFORM:
        out = this.processDestructuringUniformBuffer(
          orderedAttributes,
          metrics.blocksPerInstance
        );
        break;
    }

    // For now we add in our picking varying assignment should it be needed
    if (layer.picking.type === PickType.SINGLE) {
      out +=
        "\n// This portion is where the shader assigns the picking color that gets passed to the fragment shader\n_picking_color_pass_ = _pickingColor;\n";
    }

    // The final item in the destructuring will always be the active attribute handler to ensure elements
    // honor the active control
    out += require("../fragments/active-attribute-handler.vs");

    return out;
  }

  /**
   * This generates all Destructuring needs for the Instance Attribute strategy. For this scenario
   * we only need to dereference AutoEasingMethods so that they will follow the easing values based on the
   * injected timings by the system.
   */
  private processDestructuringInstanceAttribute<T extends Instance>(
    orderedAttributes: IInstanceAttribute<T>[]
  ) {
    let out = "";

    orderedAttributes.forEach(attribute => {
      // If this is the source easing attribute, we must add it in as an eased method along with a calculation for the
      // Easing interpolation time value based on the current time and the injected start time of the change.
      if (attribute.easing && attribute.size) {
        // Make the time calculation for the easing equation
        out += this.processAutoEasingTiming(attribute);

        out += `  ${sizeToType[attribute.size]} ${attribute.name} = ${
          attribute.easing.methodName
        }(_${attribute.name}_start, _${attribute.name}_end, _${
          attribute.name
        }_time);\n`;
      }
    });

    return out;
  }

  /**
   * This generates all Destructuring needs for the Instance Attribute Packing strategy. For this scenario
   * attributes are tighly packed into attribute blocks rather than explicitly named attributes, thus the blocks
   * must be destructured into the proper names of the attributes.
   *
   * This will, as well, destructure the auto easing methods.
   */
  private processDestructuringInstanceAttributePacking<T extends Instance>(
    orderedAttributes: IInstanceAttribute<T>[]
  ) {
    let out = "";

    // The attributes are generated in blocks already. Thus all that need be done for this scenario
    // is merely perform block destructuring
    out += this.processDestructureBlocks(orderedAttributes);

    return out;
  }

  /**
   * This generates all Destructuring needs for the Uniform Packing strategy. For this scenario
   * attributes are tighly packed into uniform blocks rather than attributes, thus the blocks
   * must be destructured into the proper names of the attributes.
   *
   * This will, as well, destructure the auto easing methods.
   */
  private processDestructuringUniformBuffer<T extends Instance>(
    orderedAttributes: IInstanceAttribute<T>[],
    blocksPerInstance: number
  ) {
    let out = "int instanceIndex = int(instance);";

    // Generate the blocks
    for (let i = 0; i < blocksPerInstance; ++i) {
      out += `  vec4 block${i} = getBlock(${i}, instanceIndex);\n`;
    }

    // Destructure the blocks
    out += this.processDestructureBlocks(orderedAttributes);

    return out;
  }

  /**
   * This produces the destructuring elements needed to utilize the attribute data stored in blocks with names
   * like:
   *
   * vec4 block0;
   * vec4 block1;
   *
   * etc
   */
  private processDestructureBlocks<T extends Instance>(
    orderedAttributes: IInstanceAttribute<T>[]
  ) {
    let out = "";

    orderedAttributes.forEach(attribute => {
      const block = attribute.block;

      // If this is the source easing attribute, we must add it in as an eased method along with a calculation for the
      // Easing interpolation time value based on the current time and the injected start time of the change.
      if (attribute.easing && attribute.size) {
        if (attribute.size === InstanceAttributeSize.FOUR) {
          out += `  ${sizeToType[attribute.size]} _${
            attribute.name
          }_end = block${block};\n`;
        } else {
          out += `  ${sizeToType[attribute.size || 1]} _${
            attribute.name
          }_end = block${block}.${makeVectorSwizzle(
            attribute.blockIndex || 0,
            attribute.size || 1
          )};\n`;
        }

        // Generate the proper timing calculation for the easing involved
        out += this.processAutoEasingTiming(attribute);

        out += `  ${sizeToType[attribute.size]} ${attribute.name} = ${
          attribute.easing.methodName
        }(_${attribute.name}_start, _${attribute.name}_end, _${
          attribute.name
        }_time);\n`;
      } else if (attribute.size === InstanceAttributeSize.FOUR) {
        // If we have a size the size of a block, then don't swizzle the vector
        out += `  ${sizeToType[attribute.size]} ${
          attribute.name
        } = block${block};\n`;
      } else if (
        attribute.resource &&
        attribute.resource.type === ResourceType.ATLAS
      ) {
        // If the attribute is an atlas, then we use the special ATLAS size and don't swizzle the vector
        out += `  ${sizeToType[InstanceAttributeSize.ATLAS]} ${
          attribute.name
        } = block${block};\n`;
      } else {
        // Do normal destructuring with any other size and type
        out += `  ${sizeToType[attribute.size || 1]} ${
          attribute.name
        } = block${block}.${makeVectorSwizzle(
          attribute.blockIndex || 0,
          attribute.size || 1
        )};\n`;
      }
    });

    return out;
  }

  /**
   * This processes the attribute to generate a timing variable used in the Destructuring of auto easing methods.
   */
  private processAutoEasingTiming<T extends Instance>(
    attribute: IInstanceAttribute<T>
  ) {
    if (!attribute.easing) {
      return;
    }

    let out = "";

    // These are common values across all easing loop styles
    const time = `_${attribute.name}_time`;
    const duration = `_${attribute.name}_duration`;
    const startTime = `_${attribute.name}_start_time`;

    switch (attribute.easing.loop) {
      // Continuous means letting the time go from 0 to infinity
      case AutoEasingLoopStyle.CONTINUOUS: {
        out += `  float ${time} = (currentTime - ${startTime}) / ${duration};\n`;
        break;
      }

      // Repeat means going from 0 to 1 then 0 to 1 etc etc
      case AutoEasingLoopStyle.REPEAT: {
        out += `  float ${time} = clamp(fract((currentTime - ${startTime}) / ${duration}), 0.0, 1.0);\n`;
        break;
      }

      // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
      case AutoEasingLoopStyle.REFLECT: {
        const timePassed = `_${attribute.name}_timePassed`;
        const pingPong = `_${attribute.name}_pingPong`;

        // Get the time passed in a linear fashion
        out += `  float ${timePassed} = (currentTime - ${startTime}) / ${duration};\n`;
        // Make a triangle wave from the time passed to ping pong the value
        out += `  float ${pingPong} = abs((fract(${timePassed} / 2.0)) - 0.5) * 2.0;\n`;
        // Ensure we're clamped to the right values
        out += `  float ${time} = clamp(${pingPong}, 0.0, 1.0);\n`;
        break;
      }

      // No loop means just linear time
      case AutoEasingLoopStyle.NONE:
      default: {
        out += `  float ${time} = clamp((currentTime - ${startTime}) / ${duration}, 0.0, 1.0);\n`;
        break;
      }
    }

    return out;
  }
}
