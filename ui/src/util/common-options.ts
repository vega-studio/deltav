import { GLSettings } from "../gl/gl-settings.js";
import type { TextureOptions } from "../gl/texture.js";
import { ILayerMaterialOptions } from "../types.js";

export type CommonMaterial = ILayerMaterialOptions & {
  modify(options: ILayerMaterialOptions): Omit<CommonMaterial, "modify>">;
};

/**
 * These are material options you may commonly see for handling various scenarios.
 */
export class CommonMaterialOptions {
  /**
   * Sets up blending for transparent shapes.
   * Removes need for FragColor.rgb *= FragColor.a in shader.
   */
  static transparentShapeBlending: CommonMaterial = {
    blending: {
      blendDst: GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: GLSettings.Material.BlendingEquations.Add,
      blendSrc: GLSettings.Material.BlendingSrcFactor.SrcAlpha,
    },
    culling: GLSettings.Material.CullSide.NONE,

    modify(options: ILayerMaterialOptions) {
      return Object.assign({}, this, options);
    },
  };

  /**
   * Sets up blending for transparent images. This requires the image to be premultipled alpha.
   * Removes need for texel.rgb *= texel.a; as it assumes the value is premultiplied.
   */
  static transparentImageBlending: CommonMaterial = {
    blending: {
      blendSrc: GLSettings.Material.BlendingSrcFactor.One,
      blendDst: GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: GLSettings.Material.BlendingEquations.Add,
    },
    culling: GLSettings.Material.CullSide.NONE,

    modify(options: ILayerMaterialOptions) {
      return Object.assign({}, this, options);
    },
  };
}

/**
 * These are common texture options that are guaranteed to work. There are only
 * so many configurations that are viable in WebGL. These shown formats are
 * directly from:
 *
 * https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
 */
export class CommonTextureOptions {
  static RGB = (
    mipMap: boolean = false,
    uploadedDataType:
      | GLSettings.Texture.SourcePixelFormat.UnsignedByte
      | GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_6_5 = GLSettings
      .Texture.SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
    type: uploadedDataType,
    generateMipMaps: mipMap,
  });

  static RGBA = (
    mipMap: boolean = false,
    uploadedDataType:
      | GLSettings.Texture.SourcePixelFormat.UnsignedByte
      | GLSettings.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4
      | GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1 = GLSettings
      .Texture.SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA,
    type: uploadedDataType,
    generateMipMaps: mipMap,
  });

  static LUMINANCE_ALPHA = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat.UnsignedByte = GLSettings
      .Texture.SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.LuminanceAlpha,
    internalFormat: GLSettings.Texture.TexelDataType.LuminanceAlpha,
    type: uploadedDataType,
    generateMipMaps: mipMap,
  });

  static LUMINANCE = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat.UnsignedByte = GLSettings
      .Texture.SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.Luminance,
    internalFormat: GLSettings.Texture.TexelDataType.Luminance,
    type: uploadedDataType,
    generateMipMaps: mipMap,
  });

  static ALPHA = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat.UnsignedByte = GLSettings
      .Texture.SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.Alpha,
    internalFormat: GLSettings.Texture.TexelDataType.Alpha,
    type: uploadedDataType,
    generateMipMaps: mipMap,
  });

  static R8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RED,
    internalFormat: GLSettings.Texture.TexelDataType.R8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static R8_SNORM = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RED,
    internalFormat: GLSettings.Texture.TexelDataType.R8_SNORM,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static R16F = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RED,
    internalFormat: GLSettings.Texture.TexelDataType.R16F,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static R32F = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED,
    internalFormat: GLSettings.Texture.TexelDataType.R32F,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R8UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R8UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R8I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R8I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R16UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedShort
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R16UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R16I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Short
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R16I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R32UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R32UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static R32I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Int
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.R32I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RG8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RG,
    internalFormat: GLSettings.Texture.TexelDataType.RG8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RG8_SNORM = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RG,
    internalFormat: GLSettings.Texture.TexelDataType.RG8_SNORM,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RG16F = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RG,
    internalFormat: GLSettings.Texture.TexelDataType.RG16F,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RG32F = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG,
    internalFormat: GLSettings.Texture.TexelDataType.RG32F,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static RG8UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG8UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static RG8I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG8I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RG16UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedShort
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG16UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RG16I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Short
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG16I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RG32UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG32UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RG32I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Int
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RG_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RG32I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static SRGB8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.SRGB8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB565 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB565,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB8_SNORM = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB8_SNORM,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static R11F_G11F_B10F = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.R11F_G11F_B10F,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB9_E5 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB9_E5,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB16F = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat | GLSettings.Texture.SourcePixelFormat.Float,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB16F,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB32F = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB32F,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB8UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB8UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB8I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB8I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB16UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedShort
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB16UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB16I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Short
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB16I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB32UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB32UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB32I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Int
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB32I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static SRGB8_ALPHA8 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.SRGB8_ALPHA8,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGBA8_SNORM = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA8_SNORM,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB5_A1 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGB5_A1,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGBA4 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA4,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGB10_A2 = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGB10_A2,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGBA16F = (
    mipMap: boolean = false,
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
      .TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
      .TextureMagFilter.Nearest
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA16F,
    type: uploadedDataType,
    minFilter,
    magFilter,
    generateMipMaps: mipMap,
  });

  static RGBA32F = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA32F,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA8UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedByte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA8UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA8I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Byte
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA8I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGB10_A2UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGB10_A2UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA16UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedShort
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA16UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA16I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Short
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA16I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA32UI = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA32UI,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static RGBA32I = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Int
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA_INTEGER,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA32I,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  });

  static DEPTH_COMPONENT16 = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedShort
  ): TextureOptions => ({
    format: GLSettings.Texture.TexelDataType.DepthComponent,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT16,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static DEPTH_COMPONENT24 = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthComponent,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT24,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static DEPTH_COMPONENT32F = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthComponent,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT32F,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static DEPTH24_STENCIL8 = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.UnsignedInt_24_8
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthStencil,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH24_STENCIL8,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });

  static DEPTH32F_STENCIL8 = (
    uploadedDataType: GLSettings.Texture.SourcePixelFormat = GLSettings.Texture
      .SourcePixelFormat.Float32UnsignedInt_24_8_REV
  ): TextureOptions => ({
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthStencil,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH32F_STENCIL8,
    type: uploadedDataType,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  });
}
