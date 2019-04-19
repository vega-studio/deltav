import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { WebGLRenderer } from "./webgl-renderer";
export declare function debugRenderTarget(renderer: WebGLRenderer, target: RenderTarget, defer?: boolean): void;
export declare function debugTexture(renderer: WebGLRenderer, texture: Texture, id: string, defer?: boolean): boolean | undefined;
export declare function debugReadPixels(renderer: WebGLRenderer, data: Uint8Array, width: number, height: number, debugId: string, defer?: boolean): void;
export declare function flushDebug(): void;
