import React from "react";

import {
  AnchorType,
  Axis2D,
  Camera2D,
  ClearFlags,
  Control2D,
  createLayer2Din3D,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
  View3D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { useCamera } from "./camera.js";
import type { ILayer2DIn3DProps } from "./scene-props.js";

/**
 * A View3D drawing one top-left-anchored RectangleLayer rectangle mapped onto
 * a 3D plane with `createLayer2Din3D` and an identity Control2D. The layer
 * config is the props `createLayer2Din3D` produced, handed to LayerJSX.
 */
const Layer2DIn3DFixture: React.FC<ILayer2DIn3DProps> = (props) => {
  const camera = useCamera(props.camera);
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: props.rect.position,
        size: props.rect.size,
        color: props.rect.color,
      })
    );
  }

  const viewConfig = React.useMemo(
    () => ({
      camera,
      background: props.clear,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }),
    []
  );

  const layerConfig = React.useMemo(() => {
    const layer = createLayer2Din3D(Axis2D[props.axis], RectangleLayer, {
      // An identity Control2D: offset [0, 0, 0], scale [1, 1, 1].
      control2D: new Control2D(new Camera2D()),
    } as any);
    // createLayer2Din3D returns a layer initializer; LayerJSX wants its props.
    const { key: _key, data: _data, ...config } = layer.init[1] as any;
    return config;
  }, []);

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <ViewJSX name="main" type={View3D} config={viewConfig} />
      <LayerJSX
        name="rect"
        type={RectangleLayer}
        providerRef={provider}
        config={layerConfig}
      />
    </TestSurface>
  );
};

registerFixture("3d/layer-2d-in-3d", Layer2DIn3DFixture);
