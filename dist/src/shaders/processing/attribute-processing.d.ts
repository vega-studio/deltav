import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IVertexAttribute } from "../../types";
import { MetricsProcessing } from "./metrics-processing";
import { UniformProcessing } from "./uniform-processing";
export declare class AttributeProcessing {
    private uniformProcessor;
    private metricsProcessor;
    constructor(uniformProcessor: UniformProcessing, metricsProcessor: MetricsProcessing);
    process<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): {
        declarations: string;
        destructuring: string;
    };
    private processDeclarations;
    private processDestructuring;
    private processDestructuringInstanceAttribute;
    private processDestructuringInstanceAttributePacking;
    private processDestructuringUniformBuffer;
    private processDestructureBlocks;
    private processAutoEasingTiming;
    private processInstanceAttributeBufferStrategy;
    private processInstanceAttributePackingBufferStrategy;
    private processVertexAttributes;
}
