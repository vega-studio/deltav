import React from "react";

// The package entry point: it also registers the 2D/3D shader modules.
import { PromiseResolver, type Surface, SurfaceJSX } from "../../ui/src/index.js";
import { HostContext } from "./fixture-registry.js";

export interface ITestSurface {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /**
   * The clear colour (0–1 RGBA) the fixture's views use as background. Only
   * documents the fixture's intent; views still set `background` themselves.
   */
  clear?: [number, number, number, number];
  /** Called with the surface once it is ready */
  onSurface?(surface: Surface): void;
  children?: React.ReactNode;
}

/**
 * Wraps a fixture's scene in a SurfaceJSX with the deterministic settings of
 * the harness: a fixed-size container at the page's top-left, pixelRatio 1,
 * preserveDrawingBuffer so the canvas can be read back between frames, and no
 * antialiasing. Signals the host once the surface is ready.
 */
export const TestSurface: React.FC<ITestSurface> = (props) => {
  const host = React.useContext(HostContext);
  const ready = React.useRef(new PromiseResolver<Surface>());

  React.useEffect(() => {
    let live = true;
    ready.current.promise.then(
      (surface) => {
        if (!live) return;
        props.onSurface?.(surface);
        host.ready();
      },
      (e) => host.fail(e)
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        position: "absolute",
        left: 0,
        top: 0,
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <SurfaceJSX
        ready={ready.current}
        pixelRatio={1}
        handlesWheelEvents={false}
        options={{ alpha: true, preserveDrawingBuffer: true, antialias: false }}
        containerProps={{
          style: { width: props.width, height: props.height },
        }}
      >
        {props.children}
      </SurfaceJSX>
    </div>
  );
};
