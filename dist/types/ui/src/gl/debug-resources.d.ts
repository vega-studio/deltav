import { RenderTarget } from "./render-target.js";
import { Texture } from "./texture.js";
import { WebGLRenderer } from "./webgl-renderer.js";
/**
 * This makes the contents of the render target appear in the bottom right of the screen.
 * This will only show the color buffer. If there are texture render targets, then you will
 * have to debug those separately.
 */
export declare function debugRenderTarget(renderer: WebGLRenderer, target: RenderTarget, defer?: boolean, ...rest: any[]): void;
/**
 * Makes a texture viewable in the bottom right of the screen.
 */
export declare function debugTexture(renderer: WebGLRenderer, texture: Texture, maxSize: number): true | undefined;
/**
 * Makes a chunk of readPixel data viewable in the bottom right of the screen.
 */
export declare function debugReadPixels(renderer: WebGLRenderer, data: Uint8Array, width: number, height: number, debugId: string, defer?: boolean, ...rest: any[]): void;
/**
 * This dequeues all debug operations
 */
export declare function flushDebug(): void;
