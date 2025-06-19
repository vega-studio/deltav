export declare function getProgramInfo(gl: WebGLRenderingContext, program: any): {
    attributeCount: number;
    attributes: (WebGLActiveInfo | null)[];
    uniformCount: number;
    uniforms: (WebGLActiveInfo | null)[];
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
    static MSAA_MAX_SAMPLES: number;
    /**
     * Max uniform buffers that can be bound at the same time (across vertex and
     * fragment shaders)
     */
    static MAX_UNIFORM_BUFFER_BINDINGS: number;
    /**
     * Max size in bytes of a single uniform buffer (you can have multiple buffers
     * at max size)
     */
    static MAX_UNIFORM_BLOCK_SIZE: number;
    /**
     * Max number of uniform blocks that can be bound to a single vertex shader
     */
    static MAX_VERTEX_UNIFORM_BLOCKS: number;
    /**
     * Max number of uniform blocks that can be bound to a single fragment shader
     */
    static MAX_FRAGMENT_UNIFORM_BLOCKS: number;
    /**
     * Max number of uniform blocks that can be declared in a program (vs + fs).
     * This is probably not used within deltav as deltav is responsible for
     * writing in the uniform buffer declarations.
     */
    static MAX_COMBINED_UNIFORM_BLOCKS: number;
    static print(): typeof WebGLStat;
}
