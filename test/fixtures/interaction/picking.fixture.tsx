import React from "react";

import {
  AnchorType,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  CommandsJSX,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  LayerJSX,
  PickType,
  RectangleInstance,
  RectangleLayer,
  SceneJSX,
  TextureJSX,
  TextureSize,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import type {
  PickEvent,
  PickingHandle,
  RectSpec,
  RGBA01,
} from "./handles.js";

export interface IPickingFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /**
   * Shapes by test id, added in key order (later ones draw on top). The
   * circle layer draws each as the circle inscribed in its square spec.
   */
  shapes: Record<string, RectSpec>;
  /** Which layer draws the shapes */
  layer: "circle" | "rectangle";
}

type Shape = RectangleInstance | CircleInstance;

function makeShape(layer: IPickingFixture["layer"], spec: RectSpec): Shape {
  if (layer === "circle") {
    return new CircleInstance({
      center: [
        spec.position[0] + spec.size[0] / 2,
        spec.position[1] + spec.size[1] / 2,
      ],
      radius: Math.min(spec.size[0], spec.size[1]) / 2,
      color: [...spec.color],
    });
  }
  return new RectangleInstance({
    anchor: { type: AnchorType.TopLeft, padding: 0 },
    position: [...spec.position],
    size: [...spec.size],
    color: [...spec.color],
  });
}

/**
 * Colour picking (PickType.SINGLE) set up as interactions.stories.tsx does
 * it: a screen-sized picking texture, a "pick" view in the same scene that
 * renders the PICKING output into it, and a pipeline command that runs
 * decodePicking. `layer` picks CircleLayer or RectangleLayer. The layer's
 * instance callbacks are recorded, as test ids,
 * in `window.__dvInteractionPicking.events`.
 */
const PickingFixture: React.FC<IPickingFixture> = (props) => {
  const provider = React.useRef<InstanceProvider<Shape> | null>(null);
  const ids = React.useRef(new Map<Shape, string>());
  const events = React.useRef<PickEvent[]>([]);
  const camera = React.useRef(new Camera2D());

  if (!provider.current) {
    provider.current = new InstanceProvider<Shape>();
    for (const [id, spec] of Object.entries(props.shapes)) {
      ids.current.set(provider.current.add(makeShape(props.layer, spec)), id);
    }
  }

  // Stable callbacks: a new config value would update the layer every render.
  const callbacks = React.useMemo(() => {
    const record =
      (type: PickEvent["type"]) =>
      (info: { instances: Shape[] }) => {
        events.current.push({
          type,
          ids: info.instances.map((i) => ids.current.get(i) ?? "?"),
        });
      };
    return {
      onMouseOver: record("over"),
      onMouseOut: record("out"),
      onMouseClick: record("click"),
      onMouseDown: record("down"),
      onMouseUp: record("up"),
    };
  }, []);

  React.useEffect(() => {
    const handle: PickingHandle = {
      get events() {
        return events.current;
      },
      clear() {
        events.current = [];
      },
    };
    window.__dvInteractionPicking = handle;
    return () => {
      delete window.__dvInteractionPicking;
    };
  }, []);

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      {CommandsJSX({
        name: "decode-picking",
        callback: (surface) => {
          surface.commands.decodePicking();
        },
      })}
      <TextureJSX
        name="pick"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <SceneJSX name="scene">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            background: props.clear,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <ViewJSX
          name="pick"
          type={View2D}
          config={{
            camera: camera.current,
            background: [0, 0, 0, 0],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: { [FragmentOutputType.PICKING]: "pick" },
            depth: true,
          }}
        />
        {props.layer === "circle" ? (
          <LayerJSX
            name="shapes"
            type={CircleLayer}
            providerRef={
              provider as React.MutableRefObject<InstanceProvider<CircleInstance> | null>
            }
            config={{ picking: PickType.SINGLE, ...callbacks }}
          />
        ) : (
          <LayerJSX
            name="shapes"
            type={RectangleLayer}
            providerRef={
              provider as React.MutableRefObject<InstanceProvider<RectangleInstance> | null>
            }
            config={{ picking: PickType.SINGLE, ...callbacks }}
          />
        )}
      </SceneJSX>
    </TestSurface>
  );
};

registerFixture("interaction/picking", PickingFixture);
