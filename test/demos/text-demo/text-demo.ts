import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  BasicSurface,
  ChartCamera,
  ClearFlags,
  createLayer,
  createView,
  EasingUtil,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  nextFrame,
  ScaleMode
} from "src";
import { DEFAULT_RESOURCES, WORDS } from "test/types";
import { BaseDemo } from "../../common/base-demo";
import { debounce } from "../../common/debounce";

const { random } = Math;

const copyToClipboard = (str: string) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selection = document.getSelection();

  if (selection) {
    const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    if (selected) {
      selection.removeAllRanges();
      selection.addRange(selected);
    }
  }
};

/**
 * Promise based wait timer function
 */
export async function wait(t: number) {
  return new Promise(resolve => setTimeout(resolve, t));
}

/**
 * A demo demonstrating particles collecting within the bounds of text.
 */
export class TextDemo extends BaseDemo {
  /** All circles created for this demo */
  labels: LabelInstance[] = [];
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    labels: new InstanceProvider<LabelInstance>()
  };

  /** GUI properties */
  parameters = {
    count: 100,
    fontSize: 14,
    words: 15,
    letterSpacing: 0,
    maxWidth: 0,
    scaleMode: ScaleMode.BOUND_MAX,

    previous: {
      count: 100
    },

    copy: () => {
      const texts = this.labels.map(lbl => lbl.text).join("\n");
      copyToClipboard(texts);
    }
  };

  /**
   * Dat gui construction
   */
  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Changes the shape the circles take on
    parameters.add(this.parameters, "count", 1, 500, 1).onChange(
      debounce(async (value: number) => {
        const delta = value - this.parameters.previous.count;

        if (delta > 0) {
          for (let i = 0; i < delta; ++i) {
            this.makeLabel();
          }
        }

        if (delta < 0) {
          for (let i = 0; i > delta; --i) {
            this.removeLabel();
          }
        }

        this.parameters.previous.count = value;
      }, 250)
    );

    parameters.add(this.parameters, "words", 1, 50, 1).onChange(
      debounce(async (_value: number) => {
        while (this.labels.length > 0) this.removeLabel();

        for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
          this.makeLabel();
        }
      }, 250)
    );

    parameters.add(this.parameters, "fontSize", 4, 80, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.fontSize = value));
        this.layoutLabels();
      }, 250)
    );

    parameters.add(this.parameters, "maxWidth", 0, 1200, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.maxWidth = value));
      }, 250)
    );

    parameters
      .add(this.parameters, "scaleMode", {
        Always: ScaleMode.ALWAYS,
        BoundMax: ScaleMode.BOUND_MAX,
        Never: ScaleMode.NEVER
      })
      .onChange();

    parameters.add(this.parameters, "copy");

    parameters.add(this.parameters, "letterSpacing", -5, 20, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.letterSpacing = value));
      }, 250)
    );
  }

  /**
   * Render pipeline for this demo
   */
  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new ChartCamera()
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["default-view"],
          wheelShouldScroll: true
        })
      }),
      pipeline: (resources, providers, cameras) => ({
        resources: [resources.font],
        scenes: [
          {
            key: "default",
            views: [
              createView({
                key: "default-view",
                background: [0, 0, 0, 1],
                camera: cameras.main,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            ],
            layers: [
              createLayer(LabelLayer, {
                animate: {
                  color: AutoEasingMethod.easeInOutCubic(500)
                },
                data: providers.labels,
                key: "labels",
                resourceKey: resources.font.key,
                scaleMode: this.parameters.scaleMode
              })
            ]
          }
        ]
      })
    });
  }

  /**
   * Initialize the demo with beginning setup and layouts
   */
  async init() {
    let resolver: Function;
    const promise = new Promise(resolve => (resolver = resolve));

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeLabel(true);
    }

    const labels = this.labels.map(lbl => lbl.text);
    this.labels = [];

    nextFrame(async () => {
      await wait(100);
      labels.forEach(lbl => this.makeLabel(false, lbl));
      resolver();
    });

    await promise;
  }

  labelReady(label: LabelInstance) {
    nextFrame(() => {
      label.color = label.color;
      label.color[3] = 1;

      EasingUtil.all(
        true,
        label.glyphs,
        [GlyphLayer.attributeNames.color],
        (
          easing: IEasingControl,
          instance: GlyphInstance,
          _instanceIndex: number,
          _attrIndex: number
        ) => {
          easing.setTiming(1000 + label.origin[1] + instance.offset[0]);
        }
      );
    });
  }

  /**
   * Makes a circle and stores it in our circles array and adds it to the rendering
   */
  makeLabel(preload?: boolean, txt?: string) {
    const words = [];

    for (let i = 0, iMax = this.parameters.words; i < iMax; ++i) {
      words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }

    const label = new LabelInstance({
      origin: [20, this.parameters.fontSize * this.labels.length],
      color: [0, random(), random(), 0.0],
      text: txt !== undefined ? txt : words.join(" "),
      fontSize: this.parameters.fontSize,
      letterSpacing: this.parameters.letterSpacing,
      onReady: this.labelReady,
      preload
    });

    this.providers.labels.add(label);
    this.labels.push(label);
  }

  /**
   * Updates the layout of all the labels
   */
  layoutLabels() {
    this.labels.forEach((lbl, i) => {
      lbl.origin = [20, i * this.parameters.fontSize];
    });
  }

  /**
   * Remove a circle fromt he rendering
   */
  removeLabel() {
    const label = this.labels.pop();
    if (label) this.providers.labels.remove(label);
  }

  /**
   * Respond to window resizes
   */
  resize() {
    // NOOP
  }
}
