import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  ChartCamera,
  createLayer,
  EasingUtil,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  InstanceProvider,
  ISceneOptions,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleMode
} from "src";
import { IDefaultResources, WORDS } from "test/types";
import { BaseDemo } from "../common/base-demo";
import { debounce } from "../common/debounce";

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
  /** The camera in use */
  camera: ChartCamera;
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
    count: 1,
    fontSize: 14,
    words: 1,
    maxWidth: 0,
    scaleMode: ScaleMode.BOUND_MAX,

    previous: {
      count: 1
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
      .onChange(
        debounce(async () => {
          this.updateLayer();
        }, 250)
      );

    parameters.add(this.parameters, "copy");
  }

  getEventManagers(
    defaultController: BasicCameraController,
    _defaultCamera: ChartCamera
  ) {
    defaultController.wheelShouldScroll = true;
    return null;
  }

  /**
   * Construct scenes or get default properties.
   */
  getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null {
    this.camera = defaultCamera;
    return super.getScenes(defaultCamera);
  }

  /**
   * Construct the layers needed. This is on a loop so we keep it very simple.
   */
  getLayers(resources: IDefaultResources): LayerInitializer[] {
    return [
      createLayer(LabelLayer, {
        animate: {
          color: AutoEasingMethod.easeInOutCubic(500)
        },
        data: this.providers.labels,
        key: "labels",
        scene: "default",
        resourceKey: resources.font.key,
        scaleMode: this.parameters.scaleMode
      })
    ];
  }

  /**
   * Initialize the demo with beginning setup and layouts
   */
  async init() {
    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeLabel();
    }
  }

  labelReady(label: LabelInstance) {
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
  }

  /**
   * Makes a circle and stores it in our circles array and adds it to the rendering
   */
  makeLabel() {
    const words = [];

    for (let i = 0, iMax = this.parameters.words; i < iMax; ++i) {
      words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }

    const label = this.providers.labels.add(
      new LabelInstance({
        origin: [20, this.parameters.fontSize * this.labels.length],
        color: [0, random(), random(), 0.0],
        text: words.join(" "),
        fontSize: this.parameters.fontSize,
        onReady: this.labelReady
      })
    );

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
