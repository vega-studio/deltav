import { Vec4 } from "../math/vector";
import { TypeVec } from "../types";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { IExtensions, IMaterialUniform, MaterialUniformType } from "./types";
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
    private _freeUnits;
    /** Indicates if blending is enabled */
    readonly blendingEnabled: boolean;
    private _blendingEnabled;
    /** The current destination factor used in the blending equation */
    readonly blendDstFactor: GLSettings.Material.BlendingDstFactor;
    private _blendDstFactor;
    /** The current destination factor used in the blending equation */
    readonly blendSrcFactor: GLSettings.Material.BlendingDstFactor | GLSettings.Material.BlendingSrcFactor;
    private _blendSrcFactor;
    /** The current equation used in the blend mode */
    readonly blendEquation: GLSettings.Material.BlendingEquations;
    private _blendEquation;
    /** Indicates which faces will be culled */
    readonly cullFace: GLSettings.Material.CullSide;
    private _cullFace;
    /** The channels in the color buffer a fragment is allowed to write to */
    readonly colorMask: TypeVec<boolean>;
    private _colorMask;
    /** The current color the context will clear when clear with the color buffer bit is called */
    readonly clearColor: [number, number, number, number];
    private _clearColor;
    /** Comparator used when testing a fragment against the depth buffer */
    readonly depthFunc: GLSettings.Material.DepthFunctions;
    private _depthFunc;
    /** Indicates if fragments are tested against the depth buffer or not */
    readonly depthTestEnabled: boolean;
    private _depthTestEnabled;
    /** Indicates if the fragment will write to the depth buffer or not */
    readonly depthMask: boolean;
    private _depthMask;
    /** Indicates if dithering is enabled */
    readonly ditheringEnabled: boolean;
    private _ditheringEnabled;
    /** The currently bound frame buffer object. null if nothing bound. */
    readonly boundFBO: WebGLFramebuffer | null;
    private _boundFBO;
    /** The currently bound render buffer object. null if nothing bound. */
    readonly boundRBO: WebGLRenderbuffer | null;
    private _boundRBO;
    /** The current id of the current bound vbo. If null, nothing is bound */
    readonly boundVBO: WebGLBuffer | null;
    private _boundVBO;
    /**
     * The current texture object bound. If null, nothing is bound. This also tracks
     * the texture unit to which it was bound. The unit and the texture object must match for
     * a binding call to be skipped.
     */
    readonly boundTexture: {
        id: WebGLTexture | null;
        unit: number;
    };
    private _boundTexture;
    /** The current program in use */
    readonly currentProgram: WebGLProgram | null;
    private _currentProgram;
    /** Indicates if the scissor test is enabled in the context */
    readonly scissorTestEnabled: boolean;
    private _scissorTestEnabled;
    /** The current bounds of the scissor test */
    readonly scissorBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private _scissorBounds;
    /** These are the current uniforms uploaded to the GPU */
    readonly currentUniforms: {
        [name: string]: IMaterialUniform<MaterialUniformType>;
    };
    private _currentUniforms;
    /** This is the texture unit currently active */
    readonly activeTextureUnit: number;
    private _activeTextureUnit;
    /**
     * This contains all of the textures that are are needing to be utilized for next draw.
     * Textures are used by either uniforms or by RenderTargets in a single draw call. Thus
     * we track the uniforms or the render targets awaiting use of the texture.
     */
    readonly textureWillBeUsed: Map<Texture, RenderTarget | Set<WebGLUniformLocation>>;
    private _textureWillBeUsed;
    /** The current viewport gl is using */
    readonly viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private _viewport;
    /** This contains all of the currently enabled vertex attribute pointers */
    readonly enabledVertexAttributeArray: number[];
    private _enabledVertexAttributeArray;
    private _willUseVertexAttributeArray;
    /** Tracks the current divisor set to a given vertex array location. */
    private _vertexAttributeArrayDivisor;
    /**
     * Generate a new state manager and establish some initial state settings by querying the context.
     */
    constructor(gl: WebGLRenderingContext, extensions: IExtensions);
    /**
     * Sets the provided buffer identifier as the current bound item.
     */
    bindVBO(id: WebGLBuffer | null): void;
    /**
     * Sets the provided buffer identifier as the current bound item
     */
    bindRBO(id: WebGLRenderbuffer): void;
    /**
     * Sets the provided buffer identifier as the current bound item
     */
    bindFBO(id: WebGLFramebuffer | null): void;
    /**
     * Sets the provided buffer identifier as the current bound item. This automatically
     * updates all stateful information to track that a texture is now utilizing a texture unit.
     */
    bindTexture(texture: Texture, target: GLSettings.Texture.TextureBindingTarget): void;
    /**
     * Flags an attribute array as going to be used. Any attribute array location
     * no longer in use will be disabled when applyVertexAttributeArrays is called.
     */
    willUseVertexAttributeArray(index: number): void;
    /**
     * This enables the necessary vertex attribute arrays.
     */
    applyVertexAttributeArrays(): void;
    /**
     * Applies (if necessary) the divisor for a given array. This only works if the array location
     * is enabled.
     */
    setVertexAttributeArrayDivisor(index: number, divisor: number): void;
    /**
     * This takes a texture and flags it's texture unit as freed if the texture has a used unit
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
     * Sets the GPU proxy to be used to handle commands that call to the GPU but don't alter
     * global GL state.
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
    useMaterial(material: Material): boolean;
    /**
     * Sets all current gl state to match the render target specified
     */
    useRenderTarget(target: RenderTarget | null): boolean;
    /**
     * This syncs the state of the GL context with the requested state of a material
     */
    syncMaterial(material: Material): boolean;
    /**
     * Performs the upload operation of a uniform to the GL context
     */
    private uploadUniform;
    /**
     * This will consume the values aggregated within willUseTextureUnit. All Texture objects
     * consumed will be assigned an active texture unit (if one was not already applied), then
     * the Texture will be compiled / updated as necessary and applied to all uniforms requiring
     * a Sampler unit.
     */
    applyUsedTextures(): boolean;
    /**
     * Attempts to assign free or freed texture units to the provided texture objects.
     * This will return a list of textures
     */
    private assignTextureUnits;
    /**
     * Applies the necessary value for a texture to be applied to a sampler uniform.
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
