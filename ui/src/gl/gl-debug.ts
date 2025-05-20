/**
 * This wraps a gl context and forces every function call to check for gl
 * errors. This slows things down a lot, but makes debugging a lot easier to
 * trace.
 */
export function glDebug<
  T extends WebGLRenderingContext | WebGL2RenderingContext,
>(gl: T): T {
  return new Proxy(gl, {
    get(target, prop: string | symbol) {
      // Get the property directly
      const orig = (target as any)[prop];
      if (typeof orig === "function") {
        // Return a wrapped function
        return function (...args: any[]) {
          const result = orig.apply(target, args);
          const error = target.getError();
          if (error !== target.NO_ERROR) {
            console.warn(`WebGL error after call: ${String(prop)}`, {
              args,
              error,
              stack: new Error().stack,
            });
          }
          return result;
        };
      }
      // For non-functions, just return the property
      return orig;
    },
  }) as T;
}
