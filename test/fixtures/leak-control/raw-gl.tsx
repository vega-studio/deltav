import React from "react";

import { HostContext } from "../fixture-registry.js";

export interface IRawGLFixture {
  width?: number;
  height?: number;
}

/**
 * Leak control without deltav: creates a WebGL2 context, a buffer and a
 * texture. With `clean` it deletes both and loses the context on unmount;
 * without it, it leaks all three.
 */
export function rawGLFixture(clean: boolean): React.FC<IRawGLFixture> {
  return function RawGLFixture(props) {
    const host = React.useContext(HostContext);
    const canvas = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const gl = canvas.current!.getContext("webgl2");
      if (!gl) {
        host.fail(new Error("leak-control: no WebGL2 context"));
        return;
      }
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(16), gl.STATIC_DRAW);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      host.ready();

      if (!clean) return;
      return () => {
        gl.deleteBuffer(buffer);
        gl.deleteTexture(texture);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }, []);

    return (
      <canvas
        ref={canvas}
        width={props.width ?? 64}
        height={props.height ?? 64}
      />
    );
  };
}
