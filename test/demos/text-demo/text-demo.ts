import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  EasingUtil,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  IFontResourceOptions,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  nextFrame,
  onAnimationLoop,
  PickType,
  preloadNumber,
  ScaleMode,
  View2D,
  wait
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { debounce } from "../../common/debounce";
import { DEFAULT_RESOURCES, WORDS } from "../../types";

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
 * A demo demonstrating particles collecting within the bounds of text.
 */
export class TextDemo extends BaseDemo {
  /** A number label demonstrating ability to smoothely render without hiccup due to preloaded number glyphs */
  numberLabel: LabelInstance;
  /** All labels created for this demo */
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
        this.numberLabel.fontSize = value;
        this.layoutLabels();
      }, 250)
    );

    parameters.add(this.parameters, "maxWidth", 0, 1200, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.maxWidth = value));
        this.numberLabel.maxWidth = value;
      }, 250)
    );

    parameters.add(this.parameters, "scaleMode", {
      Always: ScaleMode.ALWAYS,
      BoundMax: ScaleMode.BOUND_MAX,
      Never: ScaleMode.NEVER
    });

    parameters.add(this.parameters, "copy");

    parameters.add(this.parameters, "letterSpacing", -5, 20, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.letterSpacing = value));
        this.numberLabel.letterSpacing = value;
      }, 250)
    );
  }

  /**
   * Render pipeline for this demo
   */
  makeSurface(container: HTMLElement) {
    const font: IFontResourceOptions = {
      ...DEFAULT_RESOURCES.font,
      fontSource: {
        ...DEFAULT_RESOURCES.font.fontSource,
        preload: preloadNumber()
      }
    };

    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {
        font: font
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["default.default-view"],
          wheelShouldScroll: true
        })
      }),
      scenes: (resources, providers, cameras) => ({
        default: {
          views: {
            "default-view": createView(View2D, {
              background: [0, 0, 0, 1],
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            labels: createLayer(LabelLayer, {
              animate: {
                color: AutoEasingMethod.easeInOutCubic(500)
              },
              data: providers.labels,
              resourceKey: resources.font.key,
              scaleMode: this.parameters.scaleMode,
              picking: PickType.SINGLE,

              onMouseClick: info => {
                info.instances.forEach(label => {
                  label.color = [1, 1, 1, 1];

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
                      easing.setTiming(instance.offset[0]);
                    }
                  );
                });
              }
            })
          }
        }
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

    this.numberLabel = new LabelInstance({
      color: [1, 1, 1, 1],
      text: "0",
      origin: [5, 5],
      fontSize: this.parameters.fontSize
    });

    onAnimationLoop(() => {
      this.numberLabel.text = `${Math.random()}`;
    });

    this.providers.labels.add(this.numberLabel);

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
      origin: [
        5,
        this.parameters.fontSize * this.labels.length +
          this.parameters.fontSize +
          5
      ],
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
      lbl.origin = [
        5,
        i * this.parameters.fontSize + this.parameters.fontSize + 5
      ];
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
