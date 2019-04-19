import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion, ShaderIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IResourceType, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";
interface ITextureIOExpansionResource extends IResourceType {
    texture: Texture;
}
interface ITextureResourceManager {
    getResource(key: string): ITextureIOExpansionResource | null;
}
export declare class TextureIOExpansion extends BaseIOExpansion {
    manager: ITextureResourceManager;
    resourceType: number;
    constructor(resourceType: number, manager: ITextureResourceManager);
    expand<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
export {};
