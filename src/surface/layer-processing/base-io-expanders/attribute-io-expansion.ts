import { MaterialUniformType } from "src/gl/types";
import { Instance } from "src/instance-provider/instance";
import { ShaderIOHeaderInjectionResult } from "src/shaders/processing/base-shader-io-injection";
import { getAttributeShaderName } from "src/shaders/processing/formatting";
import { MetricsProcessing } from "src/shaders/processing/metrics-processing";
import { UniformProcessing } from "src/shaders/processing/uniform-processing";
import { ILayerProps, Layer } from "src/surface/layer";
import { BaseIOExpansion } from "src/surface/layer-processing/base-io-expansion";
import { LayerBufferType } from "src/surface/layer-processing/layer-buffer-type";
import { IInstanceAttribute, InstanceAttributeSize, IUniform, IVertexAttribute } from "src/types";
import { Vec4 } from "src/util/vector";

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
 * This is the basic needs of processing attributes and injecting their declarations into the shader.
 * This will handle buffer management associated with normal hardware instancing, vertex packing, and
 * uniform packing.
 *
 * This will not expand the IO in any way, rather this forms the basis for the IO input declarations
 * and arranges these declarations to handle all of the base Buffer management systems provided in the
 * default DeltaV library.
 */
export class AttributeIOExpansion extends BaseIOExpansion {
  /**
   * This is the special case where attributes are packed into a uniform buffer instead of into
   * attributes. This is to maximize compatibility with hardware and maximize flexibility in creative approaches
   * to utilizing shaders that need a lot of input.
   */
  generateUniformAttributePacking(
    metrics: MetricsProcessing
  ): ShaderIOHeaderInjectionResult {
    let out = "\n// Instance Attributes as a packed Uniform Buffer";

    // Add the uniform buffer to the shader
    out += `uniform vec4 ${UniformProcessing.uniformPackingBufferName()}[${
      metrics.totalInstanceUniformBlocks
    }];\n`;
    // Add the number of blocks an instance utilizes
    out += `int instanceSize = ${metrics.totalInstanceUniformBlocks};`;
    // Add the block retrieval method to aid in the Destructuring process
    out += `vec4 getBlock(int index, int instanceIndex) { return ${UniformProcessing.uniformPackingBufferName()}[(instanceSize * instanceIndex) + index]; }`;

    return {
      injection: out,
      material: {
        uniforms: {
          [UniformProcessing.uniformPackingBufferName()]: {
            type: MaterialUniformType.VEC4_ARRAY,
            value: new Array(metrics.totalInstanceUniformBlocks)
              .fill(0)
              .map<Vec4>(() => [0, 0, 0, 0])
          }
        }
      }
    };
  }

  /**
   * This properly handles any special case destructuring for making the decalred attribute names available
   * after the ${attribute} declaration.
   */
  processAttributeDestructuring() {

  }

  /**
   * This processes the declarations needed to set up the Input for the shader from the layer.
   *
   * This handles the buffer strategies of:
   *
   * Vertex Attributes,
   * Vertex Attribute Packing,
   * Uniform Packing
   */
  processHeaderInjection(
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): ShaderIOHeaderInjectionResult {
    let materialChanges = undefined;
    let out = "// Shader input\n";

    // If we are in a uniform buffer type strategy. Then we generate a uniform buffer that will contain
    // our instance attribute information along with some extras to help dereference from the buffer.
    if (
      layer.bufferType === LayerBufferType.UNIFORM &&
      instanceAttributes.length > 0
    ) {
      const packing = this.generateUniformAttributePacking(metrics);
      materialChanges = packing.material;
      out += packing.injection;
    }

    // Add in the vertex attributes input
    out += this.processVertexAttributes(vertexAttributes);

    // If we are in an instance attribute Buffer Type strategy, then we simply list out
    // the attributes listed in our instance attributes as attributes.
    if (
      layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE &&
      instanceAttributes.length > 0
    ) {
      out += this.processInstanceAttributeBufferStrategy(instanceAttributes);
    }

    // If we are in an instance attribute "packing" buffer type strategy, then the layer
    // is expecting to have attributes that are "blocks" instead of explicitally named
    // attributes. The layer will be utilizing the blocks to efficiently pack in our instance information
    if (
      layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE_PACKING &&
      instanceAttributes.length > 0
    ) {
      out += this.processInstanceAttributePackingBufferStrategy(
        metrics.instanceMaxBlock
      );
    }

    return {
      injection: out,
      material: materialChanges
    };
  }

  /**
   * Produces attributes that are explicitally named and set by the attribute itself.
   */
  private processInstanceAttributeBufferStrategy<T extends Instance>(
    instanceAttributes: IInstanceAttribute<T>[]
  ) {
    let out = "\n// Instance Attributes\n";

    instanceAttributes.forEach(attribute => {
      out += `attribute ${
        sizeToType[attribute.size || 1]
      } ${attribute.qualifier || ""}${(attribute.qualifier && " ") ||
        ""} ${getAttributeShaderName(attribute)};\n`;
    });

    return out;
  }

  /**
   * Produces attributes that are blocks instead of individual attributes. The system uses these
   * blocks to pack attributes tightly together to maximize capabilities.
   */
  private processInstanceAttributePackingBufferStrategy(maxBlock: number) {
    let out = "\n// Instance Attributes\n";

    // Now print out blocks up to that block
    for (let i = 0, iMax = maxBlock + 1; i < iMax; ++i) {
      out += `attribute ${sizeToType[InstanceAttributeSize.FOUR]} block${i};\n`;
    }

    return out;
  }

  /**
   * Produces the vertex attributes without any bias or modification.
   */
  private processVertexAttributes(vertexAttributes: IVertexAttribute[]) {
    // No matter what, vertex attributes listed are strictly vertex attributes
    let out = "// Vertex Attributes\n";

    vertexAttributes.forEach(attribute => {
      out += `attribute ${sizeToType[attribute.size]} ${attribute.qualifier ||
        ""}${(attribute.qualifier && " ") || ""}${attribute.name};\n`;
    });

    return out;
  }
}
