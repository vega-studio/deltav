/**
 * This defines a transform that is allowed to analyze the final product of a
 * shader and make whatever last changes it wants to on that shader.
 *
 * This is a step that is intended to operate WITHOUT all of the information
 * available from the layers
 */
export abstract class BaseShaderTransform {
  /** Implement to transform the vertex shader */
  abstract vertex(shader: string): string;
  /** Implement to transform the fragment shader */
  abstract fragment(shader: string): string;
}
