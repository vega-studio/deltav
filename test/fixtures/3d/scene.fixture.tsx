import React from "react";

import {
  ClearFlags,
  CommonMaterialOptions,
  CubeInstance,
  CubeLayer,
  fromEulerAxisAngleToQuat,
  GLSettings,
  type Instance3D,
  InstanceProvider,
  LayerJSX,
  Transform,
  View3D,
  ViewJSX,
} from "../../../ui/src/index.js";
// Not exported from the package root (docs/3d/layers.md, Gotchas).
import { TriangleInstance } from "../../../ui/src/3d/layers/triangle/triangle-instance.js";
import { TriangleLayer } from "../../../ui/src/3d/layers/triangle/triangle-layer.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { useCamera } from "./camera.js";
import { FlatCubeLayer, FlatTriangleLayer } from "./flat-layers.js";
import type { IScene3DProps, InstanceSpec, ParentSpec } from "./scene-props.js";

type SceneInstance = CubeInstance | TriangleInstance;

const CULLING = {
  none: GLSettings.Material.CullSide.NONE,
  cw: GLSettings.Material.CullSide.CW,
  ccw: GLSettings.Material.CullSide.CCW,
};

function makeInstance(layer: IScene3DProps["layer"], spec: InstanceSpec) {
  const transform = new Transform();
  if (layer === "triangle" || layer === "flat-triangle") {
    return new TriangleInstance({
      transform,
      size: typeof spec.size === "number" ? spec.size : spec.size[0],
      color: spec.color,
    });
  }
  return new CubeInstance({
    transform,
    size: typeof spec.size === "number" ? [spec.size, spec.size, spec.size] : [...spec.size],
    color: spec.color,
  });
}

function applyParent(node: Transform, parent: ParentSpec, parents: Transform[]) {
  node.localPosition = [...parent.position];
  node.localScale = [...parent.scale];
  const p = parent.parent ?? null;
  node.setParent(p === null ? void 0 : parents[p]);
}

function applyInstance(
  instance: SceneInstance,
  spec: InstanceSpec,
  parents: Transform[]
) {
  instance.transform.localPosition = [...spec.position];
  instance.transform.localRotation = fromEulerAxisAngleToQuat(
    [0, 1, 0],
    spec.rotationY ?? 0
  );
  if (instance instanceof CubeInstance) {
    instance.size =
      typeof spec.size === "number" ? [spec.size, spec.size, spec.size] : [...spec.size];
    if (spec.color) instance.color = [...spec.color];
  } else {
    instance.size = typeof spec.size === "number" ? spec.size : spec.size[0];
    if (spec.color) instance.color = [...spec.color];
  }
  const p = spec.parent ?? null;
  instance.transform.setParent(p === null ? void 0 : parents[p]);
}

/**
 * A View3D with one 3D layer: the built-in CubeLayer or TriangleLayer, or the
 * flat-colour cube layer. Camera, scene-graph parents and instances are props;
 * an update re-applies them in place (instances are added or removed at the
 * end when the count changes).
 */
const Scene3DFixture: React.FC<IScene3DProps> = (props) => {
  const camera = useCamera(props.camera);
  const parents = React.useRef<Transform[]>([]);
  const instances = React.useRef<SceneInstance[]>([]);
  const provider = React.useRef<InstanceProvider<Instance3D> | null>(null);

  const sync = (p: IScene3DProps) => {
    const specs = p.parents ?? [];
    while (parents.current.length < specs.length) {
      parents.current.push(new Transform());
    }
    specs.forEach((spec, i) => applyParent(parents.current[i], spec, parents.current));

    while (instances.current.length > p.instances.length) {
      provider.current!.remove(instances.current.pop()!);
    }
    p.instances.forEach((spec, i) => {
      let instance = instances.current[i];
      if (!instance) {
        instance = makeInstance(p.layer, spec);
        instances.current.push(instance);
        provider.current!.add(instance);
      }
      applyInstance(instance, spec, parents.current);
    });
  };

  if (!provider.current) {
    provider.current = new InstanceProvider<Instance3D>();
    sync(props);
  }

  const key = JSON.stringify([props.parents, props.instances]);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sync(props);
  }, [key]);

  const viewConfig = React.useMemo(
    () => ({
      camera,
      background: props.clear,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }),
    []
  );

  const layerConfig = React.useMemo(
    () =>
      props.culling
        ? {
            materialOptions: {
              ...CommonMaterialOptions.transparentShapeBlending,
              culling: CULLING[props.culling],
            },
          }
        : {},
    []
  );

  const type = {
    cube: CubeLayer,
    triangle: TriangleLayer,
    "flat-cube": FlatCubeLayer,
    "flat-triangle": FlatTriangleLayer,
  }[props.layer];

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <ViewJSX name="main" type={View3D} config={viewConfig} />
      <LayerJSX
        name="shapes"
        type={type as any}
        providerRef={provider as any}
        config={layerConfig}
      />
    </TestSurface>
  );
};

registerFixture("3d/scene", Scene3DFixture);
