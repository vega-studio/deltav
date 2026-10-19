import React from "react";

import {
  AnchorType,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  SceneJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import type { RectSpec, RGBA01 } from "./handles.js";

export interface IResizeFixture {
  width: number;
  height: number;
  /** The canvas size the world camera is fitted to at scale 1 */
  baseWidth: number;
  baseHeight: number;
  clear: RGBA01;
  /** Drawn by the "world" view, whose camera scale is size / base size */
  world: RectSpec;
  /** Drawn by the "screen" view, whose camera is the identity */
  screen: RectSpec;
}

function useOneRect(spec: RectSpec, scaling: ScaleMode) {
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: [...spec.position],
        size: [...spec.size],
        color: [...spec.color],
        scaling,
      })
    );
  }
  return provider;
}

/**
 * Two scenes over the full canvas. "world" keeps a fixed world range on
 * screen, as an app fitting its data to the canvas would: its camera scale is
 * set to (width / baseWidth, height / baseHeight) whenever the size props
 * change, and its rect uses ScaleMode.ALWAYS so its size follows the camera
 * scale too (the default BOUND_MAX never grows a rect past its world size).
 * "screen" has an identity camera, so its rect is in canvas pixels
 * whatever the canvas size. The screen view only clears depth, so both
 * scenes show. Resizing is a size-prop update followed by a window `resize`
 * event, which is what SurfaceJSX listens to.
 */
const ResizeFixture: React.FC<IResizeFixture> = (props) => {
  const worldProvider = useOneRect(props.world, ScaleMode.ALWAYS);
  const screenProvider = useOneRect(props.screen, ScaleMode.BOUND_MAX);
  const worldCamera = React.useRef(new Camera2D());
  const screenCamera = React.useRef(new Camera2D());

  React.useEffect(() => {
    worldCamera.current.control2D.setScale([
      props.width / props.baseWidth,
      props.height / props.baseHeight,
      1,
    ]);
  }, [props.width, props.height]);

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <SceneJSX name="world">
        <ViewJSX
          name="view"
          type={View2D}
          config={{
            camera: worldCamera.current,
            background: props.clear,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <LayerJSX
          name="rect"
          type={RectangleLayer}
          providerRef={worldProvider}
          config={{}}
        />
      </SceneJSX>
      <SceneJSX name="screen">
        <ViewJSX
          name="view"
          type={View2D}
          config={{
            camera: screenCamera.current,
            clearFlags: [ClearFlags.DEPTH],
          }}
        />
        <LayerJSX
          name="rect"
          type={RectangleLayer}
          providerRef={screenProvider}
          config={{}}
        />
      </SceneJSX>
    </TestSurface>
  );
};

registerFixture("interaction/resize", ResizeFixture);
