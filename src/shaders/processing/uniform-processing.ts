import { MaterialUniformType } from "../../gl";
import {
  IInstancingUniform,
  IUniform,
  ShaderInjectionTarget
} from "../../types";
import { Vec4 } from "../../util";
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
