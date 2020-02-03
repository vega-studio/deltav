import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IUniform } from "../../types";
/**
 * This handles processing some metrics that are commonly needed by other processors.
 */
export declare class MetricsProcessing {
    /** This is an instance's max listed block */
    instanceMaxBlock: number;
    /** This is the number of blocks each instance will use */
    blocksPerInstance: number;
    /** This is how many uniform blocks the current device can utilize in a shader */
    maxUniforms: number;
    /** This reflects how many uniform blocks are available for instancing */
    maxUniformsForInstancing: number;
    /** Get the number of instances the client's system supports specifically for uniform instancing */
    maxInstancesPerUniformBuffer: number;
    /** This is the total blocks to be used in our uniform buffer for handling instances */
    totalInstanceUniformBlocks: number;
    /**
     * This calculates how many uniform blocks are utilized based on the input uniforms
     */
    static calculateUniformBlockUseage(uniforms: IUniform[]): number;
    /**
     * Calculates all of the metrics that will be needed in this processor.
     */
    process<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[], uniforms: IUniform[]): void;
}
