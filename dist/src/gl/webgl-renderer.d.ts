import { Vec4 } from "../math";
import { Size } from "../types";
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLProxy } from "./gl-proxy";
import { GLState } from "./gl-state";
import { RenderTarget } from "./render-target";
import { Scene } from "./scene";
export interface IWebGLRendererOptions {
    alpha?: boolean;
    antialias?: boolean;
    canvas: HTMLCanvasElement;
    preserveDrawingBuffer?: boolean;
    premultipliedAlpha?: boolean;
    onNoContext?(): void;
}
export interface IWebGLRendererState {
    clearMask: [boolean, boolean, boolean];
    currentRenderTarget: RenderTarget | null;
    displaySize: Size;
    pixelRatio: number;
    renderSize: Size;
}
export declare class WebGLRenderer {
    debugContext: string;
    private _gl?;
    readonly gl: WebGLRenderingContext | undefined;
    glProxy: GLProxy;
    glState: GLState;
    options: IWebGLRendererOptions;
    state: IWebGLRendererState;
    constructor(options: IWebGLRendererOptions);
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    clearColor(color?: Vec4): void;
    dispose(): void;
    getContext(): WebGLRenderingContext | undefined;
    getDisplaySize(): Size;
    getPixelRatio(): number;
    getRenderSize(): Size;
    getFullViewport(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    prepareAttribute(geometry: Geometry, attribute: Attribute, name: string): boolean;
    render(scene: Scene, target?: RenderTarget | null): void;
    private renderModel;
    readPixels(x: number, y: number, width: number, height: number, out: ArrayBufferView): void;
    setClearColor(color: Vec4): void;
    setPixelRatio(ratio: number): void;
    setScissor(bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }, target?: RenderTarget): void;
    setSize(width: number, height: number): void;
    setRenderTarget(target: RenderTarget | null): void;
    setViewport(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
}
