import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IUniform } from "../../types";
export declare class MetricsProcessing {
    instanceMaxBlock: number;
    blocksPerInstance: number;
    maxUniforms: number;
    maxUniformsForInstancing: number;
    maxInstancesPerBuffer: number;
    totalInstanceUniformBlocks: number;
    static calculateUniformBlockUseage(uniforms: IUniform[]): number;
    process<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[], uniforms: IUniform[]): void;
}
