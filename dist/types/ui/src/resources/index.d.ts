import { colorBufferRequest, createColorBuffer } from "./color-buffer";
import { createFont, fontRequest } from "./text";
import { atlasRequest, createAtlas, createTexture, textureRequest } from "./texture";
export * from "./base-resource-manager.js";
export * from "./resource-router.js";
export * from "./text";
export * from "./texture";
export declare const RESOURCE: {
    createFont: typeof createFont;
    createAtlas: typeof createAtlas;
    createTexture: typeof createTexture;
    createColorBuffer: typeof createColorBuffer;
};
export declare const REQUEST: {
    textureRequest: typeof textureRequest;
    atlasRequest: typeof atlasRequest;
    fontRequest: typeof fontRequest;
    colorBufferRequest: typeof colorBufferRequest;
};
