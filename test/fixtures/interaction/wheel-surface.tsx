import React from "react";

import { PromiseResolver, type Surface, SurfaceJSX } from "../../../ui/src/index.js";
import { HostContext } from "../fixture-registry.js";

export interface IWheelSurface {
  width: number;
  height: number;
  onSurface?(surface: Surface): void;
  children?: React.ReactNode;
}

/**
 * TestSurface (test/fixtures/test-surface.tsx) with `handlesWheelEvents`
 * on: the same deterministic settings — fixed-size container at the page's
 * top-left, pixelRatio 1, preserveDrawingBuffer, no antialiasing — for the
 * fixtures that need wheel input. TestSurface turns wheel handling off and is
 * shared harness code, so the interaction area keeps its own variant.
 */
export const WheelSurface: React.FC<IWheelSurface> = (props) => {
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
        handlesWheelEvents={true}
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
