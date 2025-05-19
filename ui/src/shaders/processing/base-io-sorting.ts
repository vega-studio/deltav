import { Instance } from "../../instance-provider/instance.js";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../../types.js";

/**
 * This provides the sorting methods to be applied to
 */
export class BaseIOSorting {
  /**
   * This sorts the attributes such that the attributes that MUST be updated first are put to the top.
   * This is necessary for complex attributes like atlas and easing attributes who have other attributes
   * that have dependent behaviors based on their source attribute.
   */
  sortInstanceAttributes<T extends Instance>(
    a: IInstanceAttribute<T>,
    b: IInstanceAttribute<T>
  ) {
    if (a.resource && !b.resource) return -1;
    if (a.easing && !b.easing) return -1;
    return 1;
  }

  /**
   * This sorts the vertex attributes in the expected order of updating.
   */
  sortVertexAttributes(_a: IVertexAttribute, _b: IVertexAttribute) {
    return 1;
  }

  /**
   * This sorts the uniforms in the expected order of updating.
   */
  sortUniforms(_a: IUniform, _b: IUniform) {
    return 1;
  }
}
