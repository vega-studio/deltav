import { GLProxy } from "./gl-proxy";
/**
 * This is the options to apply to a texture
 */
export declare type ColorBufferOptions = Omit<Partial<ColorBuffer>, "destroy">;
/**
 * This is a buffer that is essentially the same as a Texture resource; however,
 * is different in that it can not be used as a texture in render processes. In
 * some rare cases, this is a faster render target on some hardware than others.
 */
export declare class ColorBuffer {
    /**
     * Indicates this ColorBuffer has been destroyed, meaning it is useless and
     * invalid to use within the application.
     */
    get destroyed(): boolean;
    private _destroyed;
    /**
     * This stores any gl state associated with this object. Modifying this object
     * will cause the system to get out of sync with the GPU; however, the values
     * inside this object can be read and used for custom WebGL calls as needed.
     */
    gl?: {
        /** The identifier used by gl to target this color buffer. */
        bufferId: WebGLRenderbuffer | null;
        /**
         * This is the proxy communicator with the context that generates and
         * destroys Color Buffers.
         */
        proxy: GLProxy;
    };
    /**
     * Tells the input packing to premultiply the alpha values with the other
     * channels as the texture is generated. See:
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    get internalFormat(): ColorBuffer["_internalFormat"];
    set internalFormat(val: ColorBuffer["_internalFormat"]);
    private _internalFormat;
    /** Flag indicates if the Render Buffer needs it's settings modified */
    needsSettingsUpdate: boolean;
    /**
     * The dimensions of this color buffer object.
     */
    get size(): ColorBuffer["_size"];
    set size(val: ColorBuffer["_size"]);
    private _size;
    /**
     * Default ctor
     */
    constructor(options: ColorBufferOptions);
    /**
     * Destroys and frees the resources this buffer utilizes in the gl context.
     * This also invalidates this as a viable resource permanently.
     */
    destroy(): void;
}
