import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IInstancingUniform } from "../../types";
export declare function makeUniformArrayDeclaration(totalBlocks: number): {
    fragment: string;
    materialUniforms: IInstancingUniform[];
};
export declare function makeInstanceRetrievalArray(blocksPerInstance: number): string;
export declare function makeInstanceDestructuringArray<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[], blocksPerInstance: number): string;
