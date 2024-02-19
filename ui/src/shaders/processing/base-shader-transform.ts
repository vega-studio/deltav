import type { OutputFragmentShaderSource } from "../../types";

/**
 * This defines a transform that is allowed to analyze the final product of a
 * shader and make whatever last changes it wants to on that shader.
 *
 * This is a step that is intended to operate WITHOUT all of the information
 * available from the layers
 */
export abstract class BaseShaderTransform {
  /**
   * Implement to transform the vertex shader BEFORE any changes are applied to
   * it. This includes pre module imports and output analysis.
   */
  rawVertex(shader: string): string {
    return shader;
  }

  /**
   * Implement to transform the vertex shader BEFORE any changes are applied to
   * it. This includes pre module imports and output analysis.
   */
  rawFragment(shader: OutputFragmentShaderSource): OutputFragmentShaderSource {
    return shader;
  }

  /** Implement to transform the vertex shader */
  abstract vertex(shader: string): string;
  /** Implement to transform the fragment shader */
  abstract fragment(shader: string): string;
}
