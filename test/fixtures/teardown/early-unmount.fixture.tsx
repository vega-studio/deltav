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

/** One TestSurface with one View2D and one RectangleLayer. */
const RectSurface: React.FC<ITeardownRectProps> = (props) => {
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

/**
 * Teardown case (d): the first surface is unmounted in the same tick it
 * mounted, while its SurfaceJSX is still building (before its ready
 * resolves). A second surface then mounts and signals the host.
 */
const EarlyUnmountFixture: React.FC<ITeardownRectProps> = (props) => {
  const [generation, setGeneration] = React.useState(0);

  React.useEffect(() => {
    // Parent effects run after the children's: the first SurfaceJSX has just
    // started its async mount when this replaces it.
    setGeneration(1);
  }, []);

  return <RectSurface key={generation} {...props} />;
};

registerFixture("teardown/early-unmount", EarlyUnmountFixture);
