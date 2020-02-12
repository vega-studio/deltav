import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { WebGLRenderer } from "./webgl-renderer";
/**
 * This makes the contents of the render target appear in the bottom right of the screen.
 * This will only show the color buffer. If there are texture render targets, then you will
 * have to debug those separately.
 */
export declare function debugRenderTarget(renderer: WebGLRenderer, target: RenderTarget, defer?: boolean): void;
/**
 * Makes a texture viewable in the bottom right of the screen.
 */
export declare function debugTexture(renderer: WebGLRenderer, texture: Texture, maxSize: number): true | undefined;
/**
 * Makes a chunk of readPixel data viewable in the bottom right of the screen.
 */
export declare function debugReadPixels(renderer: WebGLRenderer, data: Uint8Array, width: number, height: number, debugId: string, defer?: boolean): void;
/**
 * This dequeues all debug operations
 */
export declare function flushDebug(): void;
