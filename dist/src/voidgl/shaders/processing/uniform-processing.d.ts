import { IInstancingUniform, IUniform, ShaderInjectionTarget } from "../../types";
import { MetricsProcessing } from "./metrics-processing";
export declare class UniformProcessing {
    materialUniforms: IInstancingUniform[];
    private metricsProcessor;
    constructor(metricsProcessor: MetricsProcessing);
    generateUniformAttributePacking(): string;
    process(uniforms: IUniform[], injectionType: ShaderInjectionTarget): string;
    static uniformPackingBufferName(): string;
}
