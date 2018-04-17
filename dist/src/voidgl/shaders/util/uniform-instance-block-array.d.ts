import { IInstanceAttribute, IInstancingUniform } from '../../types';
export declare function makeUniformArrayDeclaration(totalBlocks: number): {
    fragment: string;
    materialUniforms: IInstancingUniform[];
};
export declare function makeInstanceRetrievalArray(blocksPerInstance: number): string;
export declare function makeInstanceDestructuringArray(instanceAttributes: IInstanceAttribute<any>[], blocksPerInstance: number): string;
