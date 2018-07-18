export declare function getProgramInfo(gl: WebGLRenderingContext, program: any): {
    attributeCount: number;
    attributes: any[];
    uniformCount: number;
    uniforms: any[];
};
export declare class WebGLStat {
    static MAX_VERTEX_UNIFORMS: number;
    static MAX_FRAGMENT_UNIFORMS: number;
    static MAX_VERTEX_ATTRIBUTES: number;
    static WEBGL_SUPPORTED: boolean;
    static MAX_TEXTURE_SIZE: number;
    static HARDWARE_INSTANCING: boolean;
    static HARDWARE_INSTANCING_ANGLE: boolean;
}
