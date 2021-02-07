import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion, ShaderIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IResourceType, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";
import { ResourceRouter } from "../resource-router";
/**
 * Minimal information a resource is required to have to operate for this
 * expander.
 */
interface ITextureIOExpansionResource extends IResourceType {
    texture: Texture;
}
/**
 * Minimal manager requirements for being applied to this expanded.
 */
interface ITextureResourceManager {
    /** The router all resources flow through */
    router: ResourceRouter;
    /** A method for retrieving the resource by the resources key id */
    getResource(key: string): ITextureIOExpansionResource | null;
}
/**
 * This is an expansion handler for resource attributes that requires a texture
 * to be included as a uniform on behalf of the attribute.
 */
export declare class TextureIOExpansion extends BaseIOExpansion {
    /** The manager which will contain the texture object to be used */
    manager: ITextureResourceManager;
    /** The resource type this expansion filters on */
    resourceType: number;
    constructor(resourceType: number, manager: ITextureResourceManager);
    /**
     * Provides expanded IO for attributes with resource properties.
     */
    expand<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    /**
     * Validates the IO about to be expanded.
     */
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    /**
     * For texture resources, we need the uniforms with a size of ATLAS to be
     * injected as a sampler2D instead of a vector sizing which the basic io
     * expansion can only provide.
     */
    processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
export {};
