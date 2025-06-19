import { Vec4 } from "../math/vector.js";
import { TypeVec } from "../types.js";
import { GLProxy } from "./gl-proxy.js";
import { GLSettings } from "./gl-settings.js";
import { Material, type MaterialSettings } from "./material.js";
import { RenderTarget } from "./render-target.js";
import { Texture } from "./texture.js";
import { IExtensions, IMaterialUniform, MaterialUniformType, UseMaterialStatus } from "./types.js";
import type { UniformBuffer } from "./uniform-buffer.js";
/**
 * This class represents all of the current state and settings that the gl context is in currently. This
 * helps to decide when to make gl calls to alter the state and not do so unecessarily.
 *
 * This state focuses on global state settings like bound objects and gl settings. Other state
 * for the GL context is stored within objects that are generated, such as Texture and Attribute.
 */
export declare class GLState {
    /** Message to include with debug, warns, and errors */
    debugContext: string;
    /** The extensions enabled for the context */
    private extensions;
    /** Stores the gl context this is watching the state over */
    private gl;
    /** This is a proxy to execute commands that do not change global gl state */
    private glProxy;
    /** Lookup a texture unit to it's current assigned texture. */
    private _textureUnitToTexture;
    /** This holds which texture units are free for use and have no Texture assigned to them */
    private _freeTextureUnits;
    /** Lookup a uniform buffer to it's current assigned binding point. */
    /** This holds which uniform buffer binding points are free for use and have no UniformBuffer assigned to them */
    private _freeUniformBufferBindings;
    /** Indicates if blending is enabled */
    get blendingEnabled(): boolean;
    private _blendingEnabled;
    /** The current destination factor used in the blending equation */
    get blendDstFactor(): GLSettings.Material.BlendingDstFactor;
    private _blendDstFactor;
    /** The current destination factor used in the blending equation */
    get blendSrcFactor(): GLSettings.Material.BlendingDstFactor | GLSettings.Material.BlendingSrcFactor;
    private _blendSrcFactor;
    /** The current equation used in the blend mode */
    get blendEquation(): GLSettings.Material.BlendingEquations;
    private _blendEquation;
    /** Indicates which faces will be culled */
    get cullFace(): GLSettings.Material.CullSide;
    private _cullFace;
    /** Indicates if culling is enabled */
    get cullEnabled(): boolean;
    private _cullEnabled;
    /** The channels in the color buffer a fragment is allowed to write to */
    get colorMask(): TypeVec<boolean>;
    private _colorMask;
    /** The current color the context will clear when clear with the color buffer bit is called */
    get clearColor(): Vec4;
    private _clearColor;
    /** Comparator used when testing a fragment against the depth buffer */
    get depthFunc(): GLSettings.Material.DepthFunctions;
    private _depthFunc;
    /** Indicates if fragments are tested against the depth buffer or not */
    get depthTestEnabled(): boolean;
    private _depthTestEnabled;
    /** Indicates if the fragment will write to the depth buffer or not */
    get depthMask(): boolean;
    private _depthMask;
    /** Indicates if dithering is enabled */
    get ditheringEnabled(): boolean;
    private _ditheringEnabled;
    /** The currently bound frame buffer object. null if nothing bound. */
    get boundFBO(): {
        read: WebGLFramebuffer | null;
        draw: WebGLFramebuffer | null;
    };
    private _boundFBO;
    /**
     * This is the current render target who's FBO is bound. A null render target
     * indicates the target is the screen.
     */
    get renderTarget(): RenderTarget | null;
    private _renderTarget;
    /** The currently bound render buffer object. null if nothing bound. */
    get boundRBO(): WebGLRenderbuffer | null;
    private _boundRBO;
    /** The current id of the current bound vao. If null, nothing is bound */
    get boundVAO(): WebGLVertexArrayObject | null;
    private _boundVAO;
    /** The current id of the current bound vbo. If null, nothing is bound */
    get boundVBO(): WebGLBuffer | null;
    private _boundVBO;
    /**
     * The current id of the current bound element array buffer. If null, nothing
     * is bound
     */
    get boundElementArrayBuffer(): WebGLBuffer | null;
    private _boundElementArrayBuffer;
    /**
     * The current texture object bound. If null, nothing is bound. This also tracks
     * the texture unit to which it was bound. The unit and the texture object must match for
     * a binding call to be skipped.
     */
    get boundTexture(): {
        id: WebGLTexture | null;
        unit: number;
    };
    private _boundTexture;
    /** The current program in use */
    get currentProgram(): WebGLProgram | null;
    private _currentProgram;
    /** Indicates if the scissor test is enabled in the context */
    get scissorTestEnabled(): boolean;
    private _scissorTestEnabled;
    /** The current bounds of the scissor test */
    get scissorBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private _scissorBounds;
    /** These are the current uniforms uploaded to the GPU */
    get currentUniforms(): {
        [name: string]: IMaterialUniform<MaterialUniformType>;
    };
    private _currentUniforms;
    /** This is the texture unit currently active */
    get activeTextureUnit(): number;
    private _activeTextureUnit;
    /** This is the buffer state set and activated for the drawBuffers call */
    get drawBuffers(): number[];
    private _drawBuffers;
    /**
     * This contains all of the textures that are are needing to be utilized for
     * next draw. Textures are used by either uniforms or by RenderTargets in a
     * single draw call. Thus we track the uniforms or the render targets awaiting
     * use of the texture.
     */
    get textureWillBeUsed(): Map<Texture, RenderTarget | Set<WebGLUniformLocation>>;
    private _textureWillBeUsed;
    /** The current viewport gl is using */
    get viewport(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private _viewport;
    /** This contains all of the currently enabled vertex attribute pointers */
    get enabledVertexAttributeArray(): number[];
    private _enabledVertexAttributeArray;
    private _willUseVertexAttributeArray;
    /** Tracks the current divisor set to a given vertex array location. */
    private _vertexAttributeArrayDivisor;
    /**
     * Generate a new state manager and establish some initial state settings by
     * querying the context.
     */
    constructor(gl: WebGLRenderingContext, extensions: IExtensions);
    /**
     * Sets the provided vertex array as the current bound item.
     */
    bindVAO(id: WebGLVertexArrayObject | null): void;
    /**
     * Sets the provided buffer identifier as the current bound item.
     */
    bindVBO(id: WebGLBuffer | null): void;
    /**
     * Sets the provided buffer identifier as the current bound
     * ELEMENT_ARRAY_BUFFER.
     */
    bindElementArrayBuffer(id: WebGLBuffer | null): void;
    /**
     * Sets the provided buffer identifier as the current bound item
     */
    bindRBO(id: WebGLRenderbuffer): void;
    /**
     * Sets the provided buffer identifier as the current bound item
     */
    bindFBO(id: WebGLFramebuffer | null): void;
    /**
     * Binds the read and draw framebuffers for READ and DRAW framebuffer targets.
     */
    bindFBOTargets(source: WebGLFramebuffer | null, target: WebGLFramebuffer | null): void;
    /**
     * Sets the provided buffer identifier as the current bound item. This
     * automatically updates all stateful information to track that a texture is
     * now utilizing a texture unit.
     */
    bindTexture(texture: Texture, target: GLSettings.Texture.TextureBindingTarget): void;
    /**
     * Disables all vertex attribute array indices enabled
     */
    disableVertexAttributeArray(): void;
    /**
     * Flags an attribute array as going to be used. Any attribute array location
     * no longer in use will be disabled when applyVertexAttributeArrays is
     * called.
     */
    willUseVertexAttributeArray(index: number): void;
    /**
     * This enables the necessary vertex attribute arrays.
     */
    applyVertexAttributeArrays(): void;
    /**
     * Applies (if necessary) the divisor for a given array. This only works if
     * the array location is enabled.
     */
    setVertexAttributeArrayDivisor(index: number, divisor: number): void;
    /**
     * This takes a texture and flags it's texture unit as freed if the texture
     * has a used unit
     */
    freeTextureUnit(texture: Texture): void;
    /**
     * Changes the active texture unit to the provided unit.
     */
    setActiveTextureUnit(unit: number): void;
    /**
     * Changes the gl clear color state
     */
    setClearColor(color: Vec4): void;
    /**
     * Change the drawBuffer state, if it's available
     *
     * 0 - n specifies COLOR_ATTACHMENT
     * -1 specifies NONE
     * -2 specifies BACK
     */
    setDrawBuffers(attachments: number[], preventCommit?: boolean): void;
    /**
     * Sets the GPU proxy to be used to handle commands that call to the GPU but
     * don't alter global GL state.
     */
    setProxy(proxy: GLProxy): void;
    /**
     * Enables or disables the scissor test
     */
    setScissor(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null): void;
    /**
     * Applies a viewport to the given state
     */
    setViewport(x: number, y: number, width: number, height: number): void;
    /**
     * Uses the program indicated
     */
    useProgram(program: WebGLProgram): void;
    /**
     * Sets all current gl state to match the materials settings.
     */
    useMaterial(material: Material): UseMaterialStatus;
    /**
     * This examines a given material to find the most appropriate program to run
     * based on the current RenderTarget
     */
    private findMaterialProgram;
    /**
     * Sets all current gl state to match the render target specified
     */
    useRenderTarget(target: RenderTarget | null): boolean;
    /**
     * This syncs the state of the GL context with the requested state of a
     * material
     */
    syncMaterial(material: MaterialSettings): boolean;
    /**
     * Ensures the uniform buffer is bound to a binding point and ensures the
     * program in use links it's declared uniform structures to the binding point
     * as well.
     */
    useUniformBuffer(uniformBuffer: UniformBuffer): boolean;
    /**
     * Set masking for the depth
     */
    setDepthMask(depthWrite: boolean): void;
    /**
     * Set the depth test enablement
     */
    setDepthTest(depthTest: boolean): void;
    /**
     * Set the depth function
     */
    setDepthFunc(depthFunc: Material["depthFunc"]): void;
    /**
     * Set the blend mode and settings.
     */
    setBlending(blending: Material["blending"]): void;
    /**
     * Set whether or not dithering is enabled.
     */
    setDithering(dithering: boolean): void;
    /**
     * Change the bit mask for color channels allowed to be written into.
     */
    setColorMask(colorMask: TypeVec<boolean>): void;
    /**
     * Change the cull face state
     */
    setCullFace(cullFace: GLState["_cullFace"]): void;
    /**
     * Performs the upload operation of a uniform to the GL context
     */
    private uploadUniform;
    /**
     * This will consume the values aggregated within willUseTextureUnit. All
     * Texture objects consumed will be assigned an active texture unit (if one
     * was not already applied), then the Texture will be compiled / updated as
     * necessary and applied to all uniforms requiring a Sampler unit.
     */
    applyUsedTextures(): boolean;
    /**
     * Attempts to assign free or freed texture units to the provided texture
     * objects. This will return a list of textures that could not be assigned an
     * available unit.
     *
     * NOTE: This DOES NOT CHANGE THE Active unit texture state NOR does it bind
     * the textures yet. This is merely for figuring out which texture units the
     * texture SHOULD be assigned to.
     */
    private assignTextureUnits;
    /**
     * Applies the necessary value for a texture to be applied to a sampler
     * uniform.
     */
    private uploadTextureToUniform;
    /**
     * This flags a texture as going to be used within the next upcoming draw call
     */
    willUseTextureUnit(texture: Texture, target: WebGLUniformLocation | RenderTarget): void;
    /**
     * This method applies ALL of the state elements monitored and force sets them with WebGL calls
     * to make sure the GPU is in the same state as this state object.
     */
    syncState(): void;
    /**
     * Applies the current clearColor to the gl state
     */
    private applyClearColor;
    /**
     * Applies the current depth function to the gl state
     */
    private applyDepthFunc;
    /**
     * Applies the current scissor bounds to the gl state
     */
    private applyScissorBounds;
    /**
     * Applies the writing mask to the color buffer to the gl state.
     */
    private applyColorMask;
    /**
     * Applies the blending equations to the gl state
     */
    private applyBlendEquation;
    /**
     * Applies the blending factors to the gl state
     */
    private applyBlendFactors;
    /**
     * Applies the cull face property to the gl state
     */
    private applyCullFace;
    /**
     * This applies the current viewport property to the gl context
     */
    private applyViewport;
}
