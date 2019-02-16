import * as Three from "three";
import {
  IInstancingUniform,
  IUniform,
  ShaderInjectionTarget
} from "../../types";
import { MetricsProcessing } from "./metrics-processing";

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
 * This contains methods centered around processing uniforms and generating the uniform declarations
 * needed to make a shader compatible with a layer.
 */
export class UniformProcessing {
  /** Tracks all of the generated uniforms the system created in order to aid in compatibility */
  materialUniforms: IInstancingUniform[] = [];
  /** Provides needed metrics for processing uniform generation */
  private metricsProcessor: MetricsProcessing;

  constructor(metricsProcessor: MetricsProcessing) {
    this.metricsProcessor = metricsProcessor;
  }

  /**
   * This is the special case where attributes are packed into a uniform buffer instead of into
   * attributes. This is to maximize compatibility with hardware and maximize flexibility in creative approaches
   * to utilizing shaders that need a lot of input.
   */
  generateUniformAttributePacking() {
    let out = "\n// Instance Attributes as a packed Uniform Buffer";

    // Add the uniform buffer to the shader
    out += `uniform vec4 ${UniformProcessing.uniformPackingBufferName()}[${
      this.metricsProcessor.totalInstanceUniformBlocks
    }];\n`;
    // Add the number of blocks an instance utilizes
    out += `int instanceSize = ${
      this.metricsProcessor.totalInstanceUniformBlocks
    };`;
    // Add the block retrieval method to aid in the Destructuring process
    out += `vec4 getBlock(int index, int instanceIndex) { return ${UniformProcessing.uniformPackingBufferName()}[(instanceSize * instanceIndex) + index]; }`;

    // Add our extra uniform to the material uniform output so the system can utilize it as needed.
    this.materialUniforms.push({
      name: UniformProcessing.uniformPackingBufferName(),
      type: "4fv",
      value: new Array(this.metricsProcessor.totalInstanceUniformBlocks)
        .fill(0)
        .map(() => new Three.Vector4(0, 0, 0, 0))
    });

    return out;
  }

  /**
   * Processes a layer and it's requested uniforms and generates the injections needed to declare the
   * uniforms.
   */
  process(uniforms: IUniform[], injectionType: ShaderInjectionTarget) {
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
   * This is the name of the Uniform Buffer packing strategies name for the Uniform buffer that
   * all of our attributes get packed into.
   */
  static uniformPackingBufferName() {
    return `instanceData`;
  }
}
