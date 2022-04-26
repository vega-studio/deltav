import { Vec4 } from "../math";
import { Size } from "../types";
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLProxy } from "./gl-proxy";
import { GLState } from "./gl-state";
import { RenderTarget } from "./render-target";
import { Scene } from "./scene";
/**
 * Options used to create or update the renderer.
 */
export interface IWebGLRendererOptions {
    /**
     * Determines if the rendering context renders to a buffer with an alpha channel.
     * Performs better if no alpha channel is used, but may be needed if any DOM elements or
     * backgrounds needs to bleed through the canvas.
     */
    alpha?: boolean;
    /**
     * Set to true to use the system antialiasing set up. Performs much better when false, but definitely
     * looks better when true.
     */
    antialias?: boolean;
    /**
     * This is the canvas that is required to retrieve the webgl context to make all webgl calls with.
     */
    canvas: HTMLCanvasElement;
    /**
     * This needs to be true in order to query the canvas current rendered output. Performs better when false,
     * but some cases may need it to do such operations like snapshots etc.
     */
    preserveDrawingBuffer?: boolean;
    /**
     * Set to true to make the default context expect premultipled alpha for blending.
     */
    premultipliedAlpha?: boolean;
    /**
     * Callback indicating a context could not be generated.
     */
    onNoContext?(): void;
}
/**
 * Internal state of the renderer.
 */
export interface IWebGLRendererState {
    /** Sets up a clear mask to ensure the clear operation only happens once per draw */
    clearMask: [boolean, boolean, boolean];
    /** Stores which render target is in focus for the current operations on the renderer */
    currentRenderTarget: RenderTarget | RenderTarget[] | null;
    /** The current display size of the canvas */
    displaySize: Size;
    /** The current pixel ratio in use */
    pixelRatio: number;
    /** The current rendering size of the canvas */
    renderSize: Size;
}
/**
 * This is the primary file where the rendering and compositing resources and managing
 * gl state happens. A context is provided for the renderer to work with, then it is the
 * renderer's job to ensure state changes as expected and provide as much convenience as necessary
 * to make working with the webgl pipeline as easy as possible.
 */
export declare class WebGLRenderer {
    /** When this is set this creates */
    set debugContext(val: string);
    /** The context the renderer is managing */
    private _gl?;
    /** The readonly gl context the renderer determined for use */
    get gl(): WebGLRenderingContext | undefined;
    /**
     * This is the compiler that performs all actions related to creating and
     * updating buffers and objects on the GPU
     */
    glProxy: GLProxy;
    /** This handles anything related to state changes in the GL state */
    glState: GLState;
    /** The options that constructed or are currently applied to the renderer */
    options: IWebGLRendererOptions;
    /** Any current internal state the renderer has applied to it's target */
    state: IWebGLRendererState;
    constructor(options: IWebGLRendererOptions);
    /**
     * Clears the specified buffers.
     */
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    /**
     * Clears the color either set with setClearColor, or clears the color
     * specified.
     */
    clearColor(color?: Vec4): void;
    /**
     * Free all resources this renderer utilized. Make sure textures and
     * frame/render/geometry buffers are all deleted. We may even use aggressive
     * buffer removal that force resizes the buffers so their resources are
     * immediately reduced instead of waiting for the JS engine to free up
     * resources.
     */
    dispose(): void;
    /**
     * Retrieve and establish the context from the canvas.
     */
    getContext(): WebGLRenderingContext | undefined;
    /**
     * Retrieves the size of the canvas ignoring pixel ratio.
     */
    getDisplaySize(): Size;
    /**
     * Retrieves the current pixel ratio in use for the context.
     */
    getPixelRatio(): number;
    /**
     * Retrieves the size of the rendering context. This is the pixel dimensions
     * of what is being rendered into.
     */
    getRenderSize(): Size;
    /**
     * Returns the full viewport for the current target.
     *
     * If a RenderTarget is not set, then this returns the viewport of the canvas
     * ignoring the current pixel ratio.
     */
    getFullViewport(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Prepares the specified attribute
     */
    prepareAttribute(geometry: Geometry, attribute: Attribute, name: string): boolean;
    /**
     * Renders the Scene specified.
     */
    render(scene: Scene, target?: RenderTarget | RenderTarget[] | null, stateChange?: (glState: GLState, modelId: string) => void): void;
    /**
     * Renders the specified model
     */
    private renderModel;
    /**
     * Reads the pixels from the current Render Target (or more specifically from
     * the current framebuffer)
     *
     * By default the viewport is set based on the canvas being rendered into.
     * Include a render target to make the viewport be applied with the target
     * considered rather than needing pixel density considerations.
     *
     * When the current render target has multiple buffers or IS multiple buffers,
     * then you have the ability to use bufferType to target a buffer based on
     * it's outputType to specify that buffer from which you wish to read.
     */
    readPixels(x: number, y: number, width: number, height: number, out: ArrayBufferView, bufferType?: number): void;
    /**
     * Sets the clear color to be used when the clear operation executes.
     */
    setClearColor(color: Vec4): void;
    /**
     * Applies a given ratio for the provided canvas context.
     */
    setPixelRatio(ratio: number): void;
    /**
     * Sets the region the scissor test will accept as visible. Anything outside
     * the region will be clipped.
     *
     * By default the scissor region is set based on the canvas being rendered
     * into. Include a render target to make the scissor region be applied with
     * the target considered rather than needing pixel density considerations.
     */
    setScissor(bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }, target?: RenderTarget | RenderTarget[] | null): void;
    /**
     * Resizes the render area to the specified amount.
     */
    setSize(width: number, height: number): void;
    /**
     * This sets the context to render into the indicated target
     */
    setRenderTarget(target: RenderTarget | RenderTarget[] | null): void;
    /**
     * Sets the viewport we render into.
     *
     * By default the viewport is set based on the canvas being rendered into. Include a render target
     * to make the viewport be applied with the target considered rather than needing pixel density considerations.
     */
    setViewport(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
}
