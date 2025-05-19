import { Instance } from "../../../instance-provider/instance.js";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../../shaders/processing/base-shader-io-injection.js";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing.js";
import { ILayerProps, Layer } from "../../../surface/layer.js";
import { BaseIOExpansion } from "../../../surface/layer-processing/base-io-expansion.js";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../../types.js";
/**
 * This is the basic needs of processing attributes and uniforms and injecting
 * their declarations into the shader. This will handle buffer management
 * associated with normal hardware instancing, vertex packing, and uniform
 * packing.
 *
 * This will not expand the IO in any way, rather this forms the basis for the
 * IO input declarations in the shader and arranges these declarations to handle
 * all of the base Buffer management systems provided in the default DeltaV
 * library.
 */
export declare class BasicIOExpansion extends BaseIOExpansion {
    /**
     * This is the special case where attributes are packed into a uniform buffer
     * instead of into attributes. This is to maximize compatibility with hardware
     * and maximize flexibility in creative approaches to utilizing shaders that
     * need a lot of input.
     */
    /**
     * This properly handles any special case destructuring for making the
     * decalred attribute names available after the ${attribute} declaration.
     */
    processAttributeDestructuring<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>>(layer: Layer<TInstance, TLayerProps>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<TInstance>[], _uniforms: IUniform[]): string;
    /**
     * Destructuring for normal instancing via attributes with no packing
     */
    private processDestructuringInstanceAttribute;
    /**
     * This generates all Destructuring needs for the Instance Attribute Packing
     * strategy. For this scenario attributes are tighly packed into attribute
     * blocks rather than explicitly named attributes, thus the blocks must be
     * destructured into the proper names of the attributes.
     *
     * This will, as well, destructure the auto easing methods.
     */
    private processDestructuringInstanceAttributePacking;
    /**
     * This generates all Destructuring needs for the Uniform Packing strategy.
     * For this scenario, attributes are tighly packed into uniform blocks rather
     * than attributes, thus the blocks must be destructured into the proper names
     * of the attributes.
     *
     * This will, as well, destructure the auto easing methods.
     */
    /**
     * This produces the destructuring elements needed to utilize the attribute
     * data stored in blocks with names like:
     *
     * vec4 block0; vec4 block1;
     *
     * etc
     */
    private processDestructureBlocks;
    /**
     * This processes the declarations needed to set up the Input for the shader
     * from the layer.
     *
     * This handles the buffer strategies of:
     *
     * Vertex Attributes,
     * Vertex Attribute Packing,
     * Uniform Packing
     */
    processHeaderInjection<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, layer: Layer<TInstance, TProps>, metrics: MetricsProcessing, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<TInstance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
    /**
     * Processes all IO for attribute declarations needed in the header of the
     * shader.
     */
    private processAttributeHeader;
    /**
     * Processes all IO for uniform declarations needed in the header of the
     * shader.
     */
    private processUniformHeader;
    /**
     * Produces attributes that are explicitally named and set by the attribute
     * itself.
     */
    private processInstanceAttributeBufferStrategy;
    /**
     * Produces attributes that are blocks instead of individual attributes. The
     * system uses these blocks to pack attributes tightly together to maximize
     * capabilities.
     */
    private processInstanceAttributePackingBufferStrategy;
    /**
     * Produces the vertex attributes without any bias or modification.
     */
    private processVertexAttributes;
}
