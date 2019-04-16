import { MaterialUniformType } from "src/gl/types";
import { Instance } from "src/instance-provider/instance";
import { ShaderIOHeaderInjectionResult } from "src/shaders/processing/base-shader-io-injection";
import { getAttributeShaderName } from "src/shaders/processing/formatting";
import { MetricsProcessing } from "src/shaders/processing/metrics-processing";
import { UniformProcessing } from "src/shaders/processing/uniform-processing";
import { ILayerProps, Layer } from "src/surface/layer";
import { BaseIOExpansion } from "src/surface/layer-processing/base-io-expansion";
import { LayerBufferType } from "src/surface/layer-processing/layer-buffer-type";
import { IInstanceAttribute, InstanceAttributeSize, IUniform, IVertexAttribute, PickType, ShaderInjectionTarget } from "src/types";
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
 * This method properly provides a vector's chunk of data based on a swizzle. So a size of 2
 * provides vector.xy and a size of 4 provides vector.xyzw.
 */
function makeVectorSwizzle(start: number, size: number) {
  return VECTOR_COMPONENTS.slice(start, start + size).join("");
}

/**
 * This is the basic needs of processing attributes and uniforms and injecting their declarations into the shader.
 * This will handle buffer management associated with normal hardware instancing, vertex packing, and
 * uniform packing.
 *
 * This will not expand the IO in any way, rather this forms the basis for the IO input declarations in the shader
 * and arranges these declarations to handle all of the base Buffer management systems provided in the
 * default DeltaV library.
 */
export class BasicIOExpansion extends BaseIOExpansion {
  /**
   * This is the special case where attributes are packed into a uniform buffer instead of into
   * attributes. This is to maximize compatibility with hardware and maximize flexibility in creative approaches
   * to utilizing shaders that need a lot of input.
   */
  private generateUniformAttributePacking(
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
  processAttributeDestructuring(
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): string {
    let out = "";

    // Prevent mutating
    const orderedAttributes = instanceAttributes.slice(0);

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
   * Destructuring for normal instancing via attributes with no packing
   */
  private processDestructuringInstanceAttribute(_orderedAttributes: IInstanceAttribute<Instance>[]) {
    // No-op, the attributes for normal instance attribute destructuring will simply be used directly
    // as they will not be packed in and will simply out
    return '';
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
   * This generates all Destructuring needs for the Uniform Packing strategy. For this scenario,
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

      if (attribute.size === InstanceAttributeSize.FOUR) {
        // If we have a size the size of a block, then don't swizzle the vector
        out += `  ${sizeToType[attribute.size]} ${
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
   * This processes the declarations needed to set up the Input for the shader from the layer.
   *
   * This handles the buffer strategies of:
   *
   * Vertex Attributes,
   * Vertex Attribute Packing,
   * Uniform Packing
   */
  processHeaderInjection(
    target: ShaderInjectionTarget,
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    uniforms: IUniform[]
  ): ShaderIOHeaderInjectionResult {
    let attributeDeclarations = {
      injection: '',
    };

    // Attributes are only injected into the vertex shader
    if (target === ShaderInjectionTarget.VERTEX) {
      attributeDeclarations = this.processAttributeHeader(layer, metrics, vertexAttributes, instanceAttributes);
    }

    const uniformDeclaration = this.processUniformHeader(uniforms, target);

    return {
      ...attributeDeclarations,
      injection: attributeDeclarations.injection + uniformDeclaration
    };
  }

  /**
   * Processes all IO for attribute declarations needed in the header of the shader.
   */
  private processAttributeHeader(
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
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
   * Processes all IO for uniform declarations needed in the header of the shader.
   */
  private processUniformHeader(uniforms: IUniform[], injectionType: ShaderInjectionTarget) {
    let out = "";
    const injection = injectionType || ShaderInjectionTarget.VERTEX;

    uniforms.forEach(uniform => {
      uniform.shaderInjection =
        uniform.shaderInjection || ShaderInjectionTarget.VERTEX;

      if (
        uniform.shaderInjection === injection ||
        uniform.shaderInjection === ShaderInjectionTarget.ALL
      ) {
        out += `uniform ${uniform.qualifier || ""}${
          uniform.qualifier ? " " : ""
        }${sizeToType[uniform.size]} ${uniform.name};\n`;
      }
    });

    return out;
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
