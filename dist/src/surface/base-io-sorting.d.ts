import { Instance } from "../instance-provider/instance";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../types";
export declare class BaseIOSorting {
    sortInstanceAttributes<T extends Instance>(a: IInstanceAttribute<T>, b: IInstanceAttribute<T>): 1 | -1;
    sortVertexAttributes(_a: IVertexAttribute, _b: IVertexAttribute): number;
    sortUniforms(_a: IUniform, _b: IUniform): number;
}
