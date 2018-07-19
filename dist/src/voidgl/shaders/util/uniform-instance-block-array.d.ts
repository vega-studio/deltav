import { IInstanceAttribute, IInstancingUniform } from "../../types";
import { Instance } from "../../util";
export declare function makeUniformArrayDeclaration(totalBlocks: number): {
    fragment: string;
    materialUniforms: IInstancingUniform[];
};
export declare function makeInstanceRetrievalArray(blocksPerInstance: number): string;
export declare function makeInstanceDestructuringArray<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[], blocksPerInstance: number): string;
