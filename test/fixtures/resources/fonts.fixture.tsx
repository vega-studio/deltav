import React from "react";

import {
  AnchorType,
  FontJSX,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type RGBA01, useViewConfig } from "./common.js";

/** One label, drawn with its own FontJSX resource. */
export interface IFontLabel {
  /** CSS font family of the label's font resource */
  family: string;
  text: string;
  /** Top-left corner of the label, world units (= pixels) */
  origin: [number, number];
  fontSize: number;
  color: RGBA01;
}

/** A label's laid-out box, world units, as LabelLayer reports it. */
export interface IFontLabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

declare global {
  interface Window {
    /**
     * Set by the resources/fonts fixture: each label's box once its glyphs
     * are ready (LabelInstance `onReady`), by label index.
     */
    __resourceFontBoxes?: (IFontLabelBox | undefined)[];
  }
}

export interface IFontsFixture {
  width: number;
  height: number;
  clear: RGBA01;
  labels: IFontLabel[];
}

/**
 * One FontJSX and one LabelLayer per label. Each label publishes its laid-out
 * box in `window.__resourceFontBoxes` once ready; the list is dropped on
 * unmount.
 */
const FontsFixture: React.FC<IFontsFixture> = (props) => {
  const config = useViewConfig(props.clear);

  React.useEffect(() => {
    return () => {
      delete window.__resourceFontBoxes;
    };
  }, []);

  const providers = React.useRef<
    { current: InstanceProvider<LabelInstance> }[] | null
  >(null);

  if (!providers.current) {
    window.__resourceFontBoxes = props.labels.map(() => void 0);
    providers.current = props.labels.map((label, i) => {
      const provider = new InstanceProvider<LabelInstance>();
      provider.add(
        new LabelInstance({
          anchor: { type: AnchorType.TopLeft, padding: 0 },
          origin: label.origin,
          color: label.color,
          fontSize: label.fontSize,
          text: label.text,
          onReady: (instance) => {
            if (!window.__resourceFontBoxes) return;
            window.__resourceFontBoxes[i] = {
              x: instance.origin[0],
              y: instance.origin[1],
              width: instance.size[0],
              height: instance.size[1],
            };
          },
        })
      );
      return { current: provider };
    });
  }

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      {props.labels.map((label, i) => (
        <FontJSX
          key={`font${i}`}
          name={`font${i}`}
          dynamic={true}
          fontSource={{
            family: label.family,
            size: 32,
            weight: "normal",
            type: undefined,
          }}
        />
      ))}
      <ViewJSX name="main" type={View2D} config={config} />
      {props.labels.map((_label, i) => (
        <LayerJSX
          key={`labels${i}`}
          name={`labels${i}`}
          type={LabelLayer}
          providerRef={providers.current![i]}
          config={{ resourceKey: `font${i}` }}
        />
      ))}
    </TestSurface>
  );
};

registerFixture("resources/fonts", FontsFixture);
