import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
import { Texture } from "./texture";
/**
 * This specifies a buffer and matches it to a hinting output type. The buffer
 * can be a Texture or a ColorBuffer of sorts. The outputType really only
 * matters for Texture types as it is used to help link Texture resources that
 * other processes are capable of providing information for.
 */
export declare type RenderBufferOutputTarget = {
    outputType: number;
    buffer: GLSettings.RenderTarget.ColorBufferFormat | Texture;
};
/**
 * These are the options available for creating a new RenderTarget.
 */
export interface IRenderTargetOptions {
    /**
     * Specifies the buffers the render target will render into when draw calls
     * happen.
     */
    buffers: {
        /**
         * The color buffer attachment. This allows multiple color buffers for MRT
         * when available.
         */
        color?: RenderBufferOutputTarget | RenderBufferOutputTarget[];
        /**
         * The depth buffer attachment. Exclusion automatically makes depth testing
         * not work.
         */
        depth?: GLSettings.RenderTarget.DepthBufferFormat | Texture;
        /**
         * The stencil buffer attachment. Exclusion automatically disables stencil
         * testing.
         */
        stencil?: GLSettings.RenderTarget.StencilBufferFormat | Texture;
    };
    /**
     * The height of the render target. This is used when the textures are not
     * dictating the width and the height. This is required if no Textures are
     * specified as a buffer.
     */
    height?: number;
    /**
     * If set to true, then disposing this render target will NOT cause the
     * targets that are textures to be disposed when this is disposed.
     */
    retainTextureTargets?: boolean;
    /**
     * The width of the render target. This is used when the textures are not
     * dictating the width and the width. This is required if no Textures are
     * specified as a buffer.
     */
    width?: number;
}
/**
 * This represents an FBO render target to be rendered into. This can manage
 * several targets at once for MRT (or within compatibility modes).
 *
 * DO NOT EDIT existing render targets after they are constructed. Just dispose
 * of old targets and create new ones.
 */
export declare class RenderTarget {
    /** UID for the object */
    get uid(): number;
    private _uid;
    /** The buffer settings utilized in rendering this target */
    get buffers(): {
        color: RenderBufferOutputTarget | RenderBufferOutputTarget[] | undefined;
        depth: Texture | GLSettings.RenderTarget.DepthBufferFormat | undefined;
        stencil: Texture | GLSettings.RenderTarget.StencilBufferFormat | undefined;
    };
    private _buffers;
    /**
     * The height of the render target. This is automatically set if any of the
     * buffers are a Texture object. Otherwise, this reflects the value provided
     * in the options.
     */
    get height(): number;
    private _height;
    /**
     * The width of the render target. This is automatically set if any of the
     * buffers are a Texture object. Otherwise, this reflects the value provided
     * in the options.
     */
    get width(): number;
    private _width;
    /**
     * This is a flag indicating if the render target passed it's frame buffer
     * status check
     */
    get validFramebuffer(): boolean;
    private _validFramebuffer;
    /**
     * This allows outputTargets to be specified as disabled so they will not
     * receive rendering output.
     */
    get disabledTargets(): Set<number>;
    set disabledTargets(v: Set<number>);
    private _disabledTargets;
    /**
     * Flag indicating whether or not to preserve render targets that are textures
     * or not. This is set to true for when a RenderTarget is being disposed, thus
     * cleaning out the FBO and it's attachments, but we need the Texture to live
     * on for additional purposes.
     */
    retainTextureTargets: boolean;
    /**
     * This contains gl state that is processed and identified for the render
     * target. Modifying this outside of the framework is guaranteed to break
     * something.
     */
    gl?: {
        /** Identifier for the FBO object representing this target */
        fboId: WebGLFramebuffer;
        /**
         * Each material that is generated has the potential to need a FBO to
         * properly target the buffers it is capable of rendering to.
         */
        fboByMaterial: WeakMap<Material, WebGLFramebuffer>;
        /** The color buffer(s) this target is rendering into */
        colorBufferId?: {
            data: WebGLRenderbuffer;
            outputType: number;
            attachment: number;
        } | {
            data: Texture;
            outputType: number;
            attachment: number;
        } | {
            data: WebGLRenderbuffer | Texture;
            outputType: number;
            attachment: number;
        }[];
        /** The depth buffer this target is rendering into */
        depthBufferId?: WebGLRenderbuffer | Texture;
        /** The stencil buffer this target is rendering into */
        stencilBufferId?: WebGLRenderbuffer | Texture;
        /** The managing GL proxy of this target */
        proxy: GLProxy;
    };
    constructor(options: IRenderTargetOptions);
    /**
     * This analyzes the buffers for Textures to infer the width and height. This
     * also ensures all Texture objects are the same size to prevent errors.
     */
    private calculateDimensions;
    /**
     * Free all resources associated with this render target.
     */
    dispose(): void;
    /**
     * Retrieves all color buffers associated with this target and returns them as
     * a guaranteed list.
     */
    getBuffers(): RenderBufferOutputTarget[];
    /**
     * Retrieves all generated GL buffers associated with this target and returns
     * them as a guaranteed list.
     *
     * NOTE: This is NOT intended to be used outside of the GL rendering portions
     * of the application. Messing with this or it's return values is EXTREMELY
     * unadvised unless you absolutely know what you are doing. COnsider being
     * safer with getBuffers instead.
     */
    getGLBuffers(): ({
        data: WebGLRenderbuffer;
        outputType: number;
        attachment: number;
    } | {
        data: Texture;
        outputType: number;
        attachment: number;
    } | undefined)[];
    /**
     * Gets an ordered list of all output types this render target handles.
     */
    getOutputTypes(): number[];
    /**
     * Retrieves the size of this render target (All buffers for this target will
     * match these dimensions).
     */
    getSize(): number[];
    /**
     * Retrieves all of the textures associated with this render target
     */
    getTextures(): Texture[];
    /**
     * This is a simple check to see if this render target is merely a color
     * buffer target type. This is a useful check for the renderer as being a
     * simple single color buffer target has implications to matching the render
     * target to materials.
     */
    isColorTarget(): boolean;
    /**
     * Cleanses a texture from being used as a buffer
     */
    private removeTextureFromBuffer;
    /**
     * Changes the size of this render target. This is a VERY costly operation. It
     * will delete all existing buffers associated with this target. Change the
     * intended size of each buffer / texture, then cause the buffer / texture to
     * get recreated with the new size settings.
     *
     * This operation clears any existing texture contents that may have existed.
     */
    setSize(width: number, height: number): void;
    /**
     * Flags this render target as having a valid framebuffer for rendering.
     */
    setAsValid(): void;
}
