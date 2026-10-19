import React from "react";

import {
  AnchorType,
  BasicCamera2DControllerJSX,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import type { CameraHandle, RectSpec, RGBA01 } from "./handles.js";
import { WheelSurface } from "./wheel-surface.js";

export interface ICameraFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** One world-space rectangle (ScaleMode.ALWAYS, so it scales with zoom) */
  rect: RectSpec;
}

/**
 * A BasicCamera2DControllerJSX driving the Camera2D of one View2D, with wheel
 * events on. The camera's target offset and scale are readable through
 * `window.__dvInteractionCamera`.
 */
const CameraFixture: React.FC<ICameraFixture> = (props) => {
  const camera = React.useRef(new Camera2D());
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: [...props.rect.position],
        size: [...props.rect.size],
        color: [...props.rect.color],
        scaling: ScaleMode.ALWAYS,
      })
    );
  }

  React.useEffect(() => {
    const handle: CameraHandle = {
      camera() {
        const c = camera.current.control2D;
        return {
          offset: [c.getOffset()[0], c.getOffset()[1]],
          scale: [c.getScale()[0], c.getScale()[1]],
        };
      },
    };
    window.__dvInteractionCamera = handle;
    return () => {
      delete window.__dvInteractionCamera;
    };
  }, []);

  return (
    <WheelSurface width={props.width} height={props.height}>
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: props.clear,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        name="rect"
        type={RectangleLayer}
        providerRef={provider}
        config={{}}
      />
    </WheelSurface>
  );
};

registerFixture("interaction/camera", CameraFixture);
