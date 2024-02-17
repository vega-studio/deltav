import {
  atlasRequest,
  createAtlas,
  createTexture,
  textureRequest,
} from "./texture";
import { colorBufferRequest, createColorBuffer } from "./color-buffer";
import { createFont, fontRequest } from "./text";

export * from "./base-resource-manager";
export * from "./resource-router";
export * from "./text";
export * from "./texture";

export const RESOURCE = {
  createFont,
  createAtlas,
  createTexture,
  createColorBuffer,
};

export const REQUEST = {
  textureRequest,
  atlasRequest,
  fontRequest,
  colorBufferRequest,
};
