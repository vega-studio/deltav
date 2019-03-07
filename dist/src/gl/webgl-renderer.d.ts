import { Vec2, Vec4 } from "../util";
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
    pixelRatio: number;
}
export declare class WebGLRenderer {
    private _gl?;
    readonly gl: WebGLRenderingContext | undefined;
    private glProxy;
    private glState;
    options: IWebGLRendererOptions;
    state: IWebGLRendererState;
    constructor(options: IWebGLRendererOptions);
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    clearColor(color?: Vec4): void;
    dispose(): void;
    getCanvasDimensions(): Vec2;
    getContext(): WebGLRenderingContext | undefined;
    render(scene: Scene, target?: RenderTarget | null): void;
    readPixels(x: number, y: number, width: number, height: number, out: ArrayBufferView): void;
    setClearColor(color: Vec4): void;
    setPixelRatio(ratio: number): void;
    setScissor(bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    getPixelRatio(): number;
    getSize(): {
        width: number;
        height: number;
    };
    setSize(width: number, height: number): void;
    setRenderTarget(target: RenderTarget | null): void;
    setViewport(x: number, y: number, width: number, height: number): void;
}
