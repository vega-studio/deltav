/**
 * This provides a WebGL2RenderingContext class object for the system to check instanceof so
 * type checking for WebGL2RenderingContext does not break the system
 * when the target device does not have any notion of WebGL2 within it's environment.
 *
 * This does not attempt to mimic ANY behavior, it merely makes:
 *
 * foo instanceof WebGL2RenderingContext
 *
 * return false instead of break and error the system.
 */
(window as any).WebGL2RenderingContext =
  (window as any).WebGL2RenderingContext ||
  function WebGL2RenderingContext() {
    /** Do nothing */
  };
