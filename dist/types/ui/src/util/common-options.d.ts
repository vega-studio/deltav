import { GLSettings } from "../gl/gl-settings.js";
import type { TextureOptions } from "../gl/texture.js";
import { ILayerMaterialOptions } from "../types.js";
export type CommonMaterial = ILayerMaterialOptions & {
    modify(options: ILayerMaterialOptions): Omit<CommonMaterial, "modify>">;
};
/**
 * These are material options you may commonly see for handling various scenarios.
 */
export declare class CommonMaterialOptions {
    /**
     * Sets up blending for transparent shapes.
     * Removes need for FragColor.rgb *= FragColor.a in shader.
     */
    static transparentShapeBlending: CommonMaterial;
    /**
     * Sets up blending for transparent images. This requires the image to be premultipled alpha.
     * Removes need for texel.rgb *= texel.a; as it assumes the value is premultiplied.
     */
    static transparentImageBlending: CommonMaterial;
}
/**
 * These are common texture options that are guaranteed to work. There are only
 * so many configurations that are viable in WebGL. These shown formats are
 * directly from:
 *
 * https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
 */
export declare class CommonTextureOptions {
    static RGB: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat.UnsignedByte | GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_6_5) => TextureOptions;
    static RGBA: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat.UnsignedByte | GLSettings.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4 | GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1) => TextureOptions;
    static LUMINANCE_ALPHA: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat.UnsignedByte) => TextureOptions;
    static LUMINANCE: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat.UnsignedByte) => TextureOptions;
    static ALPHA: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat.UnsignedByte) => TextureOptions;
    static R8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static R8_SNORM: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static R16F: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static R32F: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R8UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R8I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R16UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R16I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R32UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static R32I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RG8_SNORM: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RG16F: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RG32F: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG8UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG8I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG16UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG16I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG32UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RG32I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static SRGB8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB565: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB8_SNORM: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static R11F_G11F_B10F: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB9_E5: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB16F: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB32F: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB8UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB8I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB16UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB16I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB32UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB32I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static SRGB8_ALPHA8: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGBA8_SNORM: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB5_A1: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGBA4: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGB10_A2: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGBA16F: (mipMap?: boolean, uploadedDataType?: GLSettings.Texture.SourcePixelFormat, minFilter?: GLSettings.Texture.TextureMinFilter, magFilter?: GLSettings.Texture.TextureMagFilter) => TextureOptions;
    static RGBA32F: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA8UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA8I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGB10_A2UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA16UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA16I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA32UI: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static RGBA32I: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static DEPTH_COMPONENT16: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static DEPTH_COMPONENT24: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static DEPTH_COMPONENT32F: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static DEPTH24_STENCIL8: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
    static DEPTH32F_STENCIL8: (uploadedDataType?: GLSettings.Texture.SourcePixelFormat) => TextureOptions;
}
