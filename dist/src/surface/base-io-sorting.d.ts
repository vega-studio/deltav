import { Instance } from "../instance-provider/instance";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../types";
/**
 * This provides the sorting methods to be applied to
 */
export declare class BaseIOSorting {
    /**
     * This sorts the attributes such that the attributes that MUST be updated first are put to the top.
     * This is necessary for complex attributes like atlas and easing attributes who have other attributes
     * that have dependent behaviors based on their source attribute.
     */
    sortInstanceAttributes<T extends Instance>(a: IInstanceAttribute<T>, b: IInstanceAttribute<T>): 1 | -1;
    /**
     * This sorts the vertex attributes in the expected order of updating.
     */
    sortVertexAttributes(_a: IVertexAttribute, _b: IVertexAttribute): number;
    /**
     * This sorts the uniforms in the expected order of updating.
     */
    sortUniforms(_a: IUniform, _b: IUniform): number;
}
