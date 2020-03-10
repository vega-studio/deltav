import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { Texture } from "./texture";
/**
 * These are the options available for creating a new RenderTarget.
 */
export interface IRenderTargetOptions {
    /** Specifies the buffers the render target will render into when draw calls happen. */
    buffers: {
        /** The color buffer attachment. This allows multiple color buffers for MRT when available. */
        color?: GLSettings.RenderTarget.ColorBufferFormat | Texture | (GLSettings.RenderTarget.ColorBufferFormat | Texture)[];
        /** The depth buffer attachment. Exclusion automatically makes depth testing not work. */
        depth?: GLSettings.RenderTarget.DepthBufferFormat | Texture;
        /** The stencil buffer attachment. Exclusion automatically disables stencil testing. */
        stencil?: GLSettings.RenderTarget.StencilBufferFormat | Texture;
    };
    /**
     * The height of the render target. This is used when the textures are not dictating the width
     * and the height. This is required if no Textures are specified as a buffer.
     */
    height?: number;
    /**
     * If set to true, then disposing this render target will NOT cause the targets that are textures to be disposed
     * when this is disposed.
     */
    retainTextureTargets?: boolean;
    /**
     * The width of the render target. This is used when the textures are not dictating the width
     * and the width. This is required if no Textures are specified as a buffer.
     */
    width?: number;
}
/**
 * This represents an FBO render target to be rendered into. This can manage several
 * targets at once for MRT (or within compatibility modes).
 *
 * DO NOT EDIT existing render targets after they are constructed. Just dispose of old targets
 * and create new ones.
 */
export declare class RenderTarget {
    /** UID for the object */
    get uid(): number;
    private _uid;
    /** The buffer settings utilized in rendering this target */
    get buffers(): {
        color: GLSettings.RenderTarget.ColorBufferFormat | Texture | (GLSettings.RenderTarget.ColorBufferFormat | Texture)[] | undefined;
        depth: Texture | GLSettings.RenderTarget.DepthBufferFormat | undefined;
        stencil: Texture | GLSettings.RenderTarget.StencilBufferFormat | undefined;
    };
    private _buffers;
    /**
     * The height of the render target. This is automatically set if any of the buffers are a Texture
     * object. Otherwise, this reflects the value provided in the options.
     */
    get height(): number;
    private _height;
    /**
     * The width of the render target. This is automatically set if any of the buffers are a Texture
     * object. Otherwise, this reflects the value provided in the options.
     */
    get width(): number;
    private _width;
    /**
     * This is a flag indicating if the render target passed it's frame buffer status check
     */
    get validFramebuffer(): boolean;
    private _validFramebuffer;
    /** Flag indicating whether or not to preserve render targets that are textures or not. */
    retainTextureTargets: boolean;
    /**
     * Split buffers occur to handle compatibility problems with MRT (multi render targeting)
     * If the system this is running on does not support MRT, then for every color buffer attachment
     * requested, we need to create a split buffer that has a single color buffer for each color buffer
     * provided.
     *
     * TODO: We have not implemented split render buffers yet.
     */
    get splitRenderBuffers(): RenderTarget[] | null;
    private _splitRenderBuffers;
    /**
     * This contains gl state that is processed and identified for the render target.
     * Modifying this outside of the framework is guaranteed to break something.
     */
    gl?: {
        /** Identifier for the FBO object representing this target */
        fboId: WebGLFramebuffer;
        /** The color buffer(s) this target is rendering into */
        colorBufferId?: WebGLRenderbuffer | Texture | (WebGLRenderbuffer | Texture)[];
        /** The depth buffer this target is rendering into */
        depthBufferId?: WebGLRenderbuffer | Texture;
        /** The stencil buffer this target is rendering into */
        stencilBufferId?: WebGLRenderbuffer | Texture;
        /** The managing GL proxy of this target */
        proxy: GLProxy;
    };
    constructor(options: IRenderTargetOptions);
    /**
     * Free all resources associated with this render target.
     */
    dispose(): void;
    /**
     * This analyzes the buffers for Textures to infer the width and height. This
     * also ensures all Texture objects are the same size to prevent errors.
     */
    private getDimensions;
    /**
     * Retrieves all of the textures associated with this render target
     */
    getTextures(): Texture[];
    /**
     * Cleanses a texture from being used as a buffer
     */
    private removeTextureFromBuffer;
    /**
     * Changes the size of this render target. This is a VERY costly operation.
     * It will delete all existing buffers associated with this target. Change the intended
     * size of each buffer / texture, then cause the buffer / texture to get recreated with
     * the new size settings.
     *
     * This operation clears any existing texture contents that may have existed.
     */
    setSize(width: number, height: number): void;
    /**
     * Flags this render target as having a valid framebuffer for rendering.
     */
    setAsValid(): void;
}
