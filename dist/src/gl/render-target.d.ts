import { GLProxy } from "src/gl/gl-proxy";
import { GLSettings } from "./gl-settings";
import { Texture } from "./texture";
export interface IRenderTargetOptions {
    buffers: {
        color?: GLSettings.RenderTarget.ColorBufferFormat | Texture | (GLSettings.RenderTarget.ColorBufferFormat | Texture)[];
        depth?: GLSettings.RenderTarget.DepthBufferFormat | Texture;
        stencil?: GLSettings.RenderTarget.StencilBufferFormat | Texture;
    };
    height?: number;
    width?: number;
}
export declare class RenderTarget {
    readonly buffers: {
        color: Texture | GLSettings.RenderTarget.ColorBufferFormat | (Texture | GLSettings.RenderTarget.ColorBufferFormat)[] | undefined;
        depth: Texture | GLSettings.RenderTarget.DepthBufferFormat | undefined;
        stencil: Texture | GLSettings.RenderTarget.StencilBufferFormat | undefined;
    };
    private _buffers;
    readonly height: number;
    private _height;
    readonly width: number;
    private _width;
    readonly splitRenderBuffers: RenderTarget[] | null;
    private _splitRenderBuffers;
    gl?: {
        fboId: WebGLFramebuffer;
        colorBufferId?: WebGLRenderbuffer | Texture | (WebGLRenderbuffer | Texture)[];
        depthBufferId?: WebGLRenderbuffer | Texture;
        stencilBufferId?: WebGLRenderbuffer | Texture;
        proxy: GLProxy;
    };
    constructor(options: IRenderTargetOptions);
    dispose(): void;
    private getDimensions;
    getTextures(): Texture[];
    private removeTextureFromBuffer;
    setSize(width: number, height: number): void;
}
