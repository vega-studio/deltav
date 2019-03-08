export declare namespace GLSettings {
    namespace RenderTarget {
        enum ColorBufferFormat {
            RGBA4 = 0,
            RGB565 = 1,
            RGB5_A1 = 2
        }
        enum DepthBufferFormat {
            DEPTH_COMPONENT16 = 0,
            DEPTH_STENCIL = 1
        }
        enum StencilBufferFormat {
            STENCIL_INDEX8 = 0
        }
    }
    namespace Material {
        enum Blending {
            NoBlending = 0,
            NormalBlending = 1,
            AdditiveBlending = 2,
            SubtractiveBlending = 3,
            MultiplyBlending = 4
        }
        enum BlendingDstFactor {
            Zero = 0,
            One = 1,
            SrcColor = 2,
            OneMinusSrcColor = 3,
            SrcAlpha = 4,
            OneMinusSrcAlpha = 5,
            DstAlpha = 6,
            OneMinusDstAlpha = 7,
            DstColor = 8,
            OneMinusDstColor = 9
        }
        enum BlendingSrcFactor {
            Zero = 0,
            One = 1,
            SrcColor = 2,
            OneMinusSrcColor = 3,
            SrcAlpha = 4,
            OneMinusSrcAlpha = 5,
            DstAlpha = 6,
            OneMinusDstAlpha = 7,
            DstColor = 8,
            OneMinusDstColor = 9,
            SrcAlphaSaturate = 10
        }
        enum BlendingEquations {
            Add = 0,
            Subtract = 1,
            ReverseSubtract = 2
        }
        enum DepthFunctions {
            NEVER = 0,
            LESS = 1,
            EQUAL = 2,
            LESS_OR_EQUAL = 3,
            GREATER = 4,
            NOTEQUAL = 5,
            GREATER_OR_EQUAL = 6,
            ALWAYS = 7
        }
        enum CullSide {
            NONE = 0,
            CW = 1,
            CCW = 2,
            BOTH = 3
        }
    }
    namespace Model {
        enum DrawMode {
            LINE_LOOP = 0,
            LINE_STRIP = 1,
            LINES = 2,
            POINTS = 3,
            TRIANGLE_FAN = 4,
            TRIANGLE_STRIP = 5,
            TRIANGLES = 6
        }
    }
    namespace Texture {
        enum TextureBindingTarget {
            TEXTURE_2D = 0,
            CUBE_MAP = 1
        }
        enum Wrapping {
            REPEAT = 0,
            CLAMP_TO_EDGE = 1,
            MIRRORED_REPEAT = 2
        }
        enum TextureMinFilter {
            Nearest = 0,
            NearestMipMapNearest = 1,
            NearestMipMapLinear = 2,
            Linear = 3,
            LinearMipMapNearest = 4,
            LinearMipMapLinear = 5
        }
        enum TextureMagFilter {
            Nearest = 0,
            Linear = 1
        }
        enum SourcePixelFormat {
            UnsignedByte = 0,
            UnsignedShort_5_6_5 = 1,
            UnsignedShort_4_4_4_4 = 2,
            UnsignedShort_5_5_5_1 = 3,
            UnsignedShort = 4,
            UnsignedInt = 5,
            UnsignedInt_24_8 = 6,
            Byte = 7,
            Short = 8,
            Int = 9,
            Float = 10,
            HalfFloat = 11,
            UnsignedInt_2_10_10_10_REV = 12,
            UnsignedInt_10F_11F_11F_REV = 13,
            UnsignedInt_5_9_9_9_REV = 14,
            Float32UnsignedInt_24_8_REV = 15
        }
        enum TexelDataType {
            Alpha = 0,
            DepthComponent = 1,
            DepthStencil = 2,
            Luminance = 3,
            LuminanceAlpha = 4,
            RGB = 5,
            RGBA = 6,
            RGBE = 7
        }
        enum PackAlignment {
            ONE = 1,
            TWO = 2,
            FOUR = 4,
            EIGHT = 8
        }
        enum UnpackAlignment {
            ONE = 1,
            TWO = 2,
            FOUR = 4,
            EIGHT = 8
        }
    }
    namespace Renderer {
        enum ReadFilter {
            ALPHA = 0,
            RGB = 1,
            RGBA = 2
        }
        enum ReadTargetArrayFormat {
            UNSIGNED_BYTE = 0,
            UNSIGNED_SHORT_5_6_5 = 1,
            UNSIGNED_SHORT_4_4_4_4 = 2,
            UNSIGNED_SHORT_5_5_5_1 = 3,
            FLOAT = 4
        }
    }
}
