/// <reference types="webgl2" />
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLState } from "./gl-state";
import { Material } from "./material";
import { Model } from "./model";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { GLContext, IExtensions } from "./types";
export declare class GLProxy {
    gl: GLContext;
    state: GLState;
    extensions: IExtensions;
    private fragmentShaders;
    private vertexShaders;
    private programs;
    constructor(gl: GLContext, state: GLState, extensions: IExtensions);
    static addExtensions(gl: GLContext): {
        instancing: WebGL2RenderingContext | ANGLE_instanced_arrays | undefined;
        drawBuffers: WebGL2RenderingContext | WEBGL_draw_buffers | undefined;
    };
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    clearColor(): void;
    compileAttribute(attribute: Attribute): true | undefined;
    compileGeometry(geometry: Geometry): boolean;
    compileMaterial(material: Material): true | undefined;
    compileRenderTarget(target: RenderTarget): boolean | undefined;
    private compileDepthBuffer;
    private compileStencilBuffer;
    private compileColorBuffer;
    compileTexture(texture: Texture): true | undefined;
    draw(model: Model): void;
    disposeMaterial(material: Material): void;
    disposeRenderBuffer(buffer: WebGLRenderbuffer): void;
    disposeRenderTarget(target: RenderTarget): void;
    disposeTexture(texture: Texture): void;
    static getContext(canvas: HTMLCanvasElement, options: {}): {
        context: WebGLRenderingContext | null;
        extensions: IExtensions;
    };
    printError(): void;
    updateTexture(texture: Texture): void;
    updateTextureData(texture: Texture): void;
    updateTextureSettings(texture: Texture): void;
    updateAttribute(attribute: Attribute): true | undefined;
    useAttribute(name: string, attribute: Attribute): boolean | undefined;
}