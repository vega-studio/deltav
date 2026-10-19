import React from "react";

import {
  LayerJSX,
  RectangleLayer,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import {
  type ITeardownRectProps,
  useRectProvider,
  useViewConfig,
} from "./rect-scene.js";

/**
 * Teardown case (e): a window resize lands inside SurfaceJSX's resize
 * debounce window right as it unmounts. This component's effect cleanup runs
 * before the SurfaceJSX's own (React unmounts effects parent first), so the
 * surface schedules its debounced fit and is then torn down.
 */
const ResizeUnmountFixture: React.FC<ITeardownRectProps> = (props) => {
  const provider = useRectProvider(props);
  const config = useViewConfig(props.clear);

  React.useEffect(
    () => () => {
      window.dispatchEvent(new Event("resize"));
    },
    []
  );

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <ViewJSX name="main" type={View2D} config={config} />
      <LayerJSX
        name="rect"
        type={RectangleLayer}
        providerRef={provider}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("teardown/resize-unmount", ResizeUnmountFixture);
