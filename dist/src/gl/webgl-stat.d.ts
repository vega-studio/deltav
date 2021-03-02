export declare function getProgramInfo(gl: WebGLRenderingContext, program: any): {
    attributeCount: number;
    attributes: any[];
    uniformCount: number;
    uniforms: any[];
};
export declare class WebGLStat {
    static VAO: boolean;
    static DEPTH_TEXTURE: boolean;
    static MAX_VERTEX_UNIFORMS: number;
    static MAX_FRAGMENT_UNIFORMS: number;
    static MAX_VERTEX_ATTRIBUTES: number;
    static WEBGL_SUPPORTED: boolean;
    static MAX_TEXTURE_SIZE: number;
    static HARDWARE_INSTANCING: boolean;
    static MRT_EXTENSION: boolean;
    static MRT: boolean;
    static MAX_COLOR_ATTACHMENTS: number;
    static SHADERS_3_0: boolean;
    static WEBGL_VERSION: string;
    static FLOAT_TEXTURE_READ: {
        half: boolean;
        full: boolean;
        halfLinearFilter: boolean;
        fullLinearFilter: boolean;
    };
    static FLOAT_TEXTURE_WRITE: {
        half: boolean;
        full: boolean;
    };
    static print(): typeof WebGLStat;
}
