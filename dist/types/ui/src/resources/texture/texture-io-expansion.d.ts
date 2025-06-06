import { Texture } from "../../gl/texture.js";
import { Instance } from "../../instance-provider/instance.js";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../shaders/processing/base-shader-io-injection.js";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing.js";
import { ILayerProps, Layer } from "../../surface/layer.js";
import { BaseIOExpansion, ShaderIOExpansion } from "../../surface/layer-processing/base-io-expansion.js";
import { IInstanceAttribute, IResourceType, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types.js";
import { ResourceRouter } from "../resource-router.js";
/**
 * Minimal information a resource is required to have to operate for this
 * expander.
 */
interface ITextureIOExpansionResource extends IResourceType {
    texture?: Texture;
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
    expand<TInstance extends Instance, TProps extends ILayerProps<TInstance>, TInstAttr extends IInstanceAttribute<TInstance>>(_layer: Layer<TInstance, TProps>, instanceAttributes: TInstAttr[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<TInstance>;
    /**
     * Validates the IO about to be expanded.
     */
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    /**
     * For texture resources, we need the uniforms with a size of ATLAS to be
     * injected as a sampler2D instead of a vector sizing which the basic io
     * expansion can only provide.
     */
    processHeaderInjection<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<TInstance, TProps>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<TInstance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
export {};
