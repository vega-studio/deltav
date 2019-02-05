/**
 * Defines a uniform applied to a material
 */
export interface IMaterialUniform {
  type: "f" | "v2" | "v3" | "v4" | "Matrix3fv" | "Matrix4fv";
  value: number[];
}
