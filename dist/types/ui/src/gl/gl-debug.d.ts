/**
 * This wraps a gl context and forces every function call to check for gl
 * errors. This slows things down a lot, but makes debugging a lot easier to
 * trace.
 */
export declare function glDebug<T extends WebGLRenderingContext | WebGL2RenderingContext>(gl: T): T;
