import React from "react";

import { HostContext, registerFixture } from "../fixture-registry.js";

export interface IRawWebGLFixture {
  width: number;
  height: number;
  /** Clear colour, 0–1 RGBA */
  clear: [number, number, number, number];
  /** Rect filled through the scissor test, canvas pixels with origin top-left */
  rect: { x: number; y: number; width: number; height: number };
  /** Fill colour, 0–1 RGBA */
  fill: [number, number, number, number];
}

/**
 * Methodology control without deltav: clears the canvas, then clears a
 * scissor rect with a second colour using plain WebGL2. The pixels it writes
 * are known exactly, so the probes must read exactly them. The scissor box is
 * specified bottom-left (GL convention) and converted from the top-left rect
 * here, which is what proves the readback orientation.
 */
const RawWebGLFixture: React.FC<IRawWebGLFixture> = (props) => {
  const host = React.useContext(HostContext);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const el = canvas.current!;
    const gl = el.getContext("webgl2", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      host.fail(new Error("raw-webgl fixture: no WebGL2 context"));
      return;
    }

    const { rect, clear, fill } = props;
    gl.viewport(0, 0, el.width, el.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(clear[0], clear[1], clear[2], clear[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(rect.x, el.height - rect.y - rect.height, rect.width, rect.height);
    gl.clearColor(fill[0], fill[1], fill[2], fill[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    host.ready();

    return () => {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      width={props.width}
      height={props.height}
      style={{ display: "block", width: props.width, height: props.height }}
    />
  );
};

registerFixture("control/raw-webgl", RawWebGLFixture);
