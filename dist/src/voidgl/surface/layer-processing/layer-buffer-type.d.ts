import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IVertexAttribute } from "../../types";
import { Layer } from "../layer";
import { Scene } from "../scene";
export declare enum LayerBufferType {
    UNIFORM = 0,
    INSTANCE_ATTRIBUTE = 1,
    INSTANCE_ATTRIBUTE_PACKING = 2
}
export declare function getLayerBufferType<T extends Instance>(_gl: WebGLRenderingContext, layer: Layer<T, any>, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): LayerBufferType;
export declare function makeLayerBufferManager<T extends Instance>(gl: WebGLRenderingContext, layer: Layer<T, any>, scene: Scene): void;
