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

/** Teardown case (a): one View2D and one RectangleLayer. */
const ViewLayerFixture: React.FC<ITeardownRectProps> = (props) => {
  const provider = useRectProvider(props);
  const config = useViewConfig(props.clear);

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

registerFixture("teardown/view-layer", ViewLayerFixture);
