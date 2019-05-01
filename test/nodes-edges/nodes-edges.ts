import { hsl } from "d3-color";
import * as datGUI from "dat.gui";
import {
  add2,
  AnchorType,
  AutoEasingMethod,
  BasicCameraController,
  ChartCamera,
  CircleInstance,
  CircleLayer,
  copy2,
  copy4,
  createLayer,
  EasingUtil,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  InstanceProvider,
  IPickInfo,
  ISceneOptions,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  nextFrame,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  Vec4
} from "src";
import { IDefaultResources, WORDS } from "test/types";
import { BaseDemo } from "../common/base-demo";
import { debounce } from "../common/debounce";

/**
 * Promise based wait timer function
 */
export async function wait(t: number) {
  return new Promise(resolve => setTimeout(resolve, t));
}

/**
 * A demo demonstrating particles collecting within the bounds of text.
 */
export class NodesEdges extends BaseDemo {
  /** The camera in use */
  camera: ChartCamera;
  circles: CircleInstance[] = [];
  edges: EdgeInstance[] = [];
  labels: LabelInstance[] = [];
  rectangles: RectangleInstance[] = [];
  lblToRect = new Map<LabelInstance, RectangleInstance>();
  center: CircleInstance;

  /** Surface providers */
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    edges: new InstanceProvider<EdgeInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  /** GUI properties */
  parameters = {
    count: 10,
    fontSize: 14,
    scaleMode: ScaleMode.BOUND_MAX,

    previous: {
      count: 10
    }
  };

  /**
   * Dat gui construction
   */
  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Changes the shape the circles take on
    parameters.add(this.parameters, "count", 1, 100, 1).onChange(
      debounce(async (value: number) => {
        const delta = value - this.parameters.previous.count;

        if (delta > 0) {
          for (let i = 0; i < delta; ++i) {
            this.makeNode();
          }
        }

        if (delta < 0) {
          for (let i = 0; i > delta; --i) {
            this.removeNode();
          }
        }

        this.layout();
        this.parameters.previous.count = value;
      }, 250)
    );

    parameters.add(this.parameters, "fontSize", 4, 80, 1).onChange(
      debounce(async (value: number) => {
        this.labels.forEach(lbl => (lbl.fontSize = value));
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
  }

  getEventManagers(
    defaultController: BasicCameraController,
    _defaultCamera: ChartCamera
  ) {
    defaultController.wheelShouldScroll = false;
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
      createLayer(EdgeLayer, {
        animate: {
          colorStart: AutoEasingMethod.easeInOutCubic(500),
          colorEnd: AutoEasingMethod.easeInOutCubic(500)
        },
        data: this.providers.edges,
        key: "edges",
        scene: "default",
        type: EdgeType.LINE
      }),
      createLayer(CircleLayer, {
        animate: {
          color: AutoEasingMethod.easeInOutCubic(500)
        },
        data: this.providers.circles,
        key: "circles",
        scene: "default",
        scaleFactor: () => this.camera.scale[0],
        picking: PickType.SINGLE,

        onMouseOver: (info: IPickInfo<CircleInstance>) => {
          const over = new Set();
          info.instances.forEach(circle => over.add(circle));

          this.circles.forEach(circle => {
            if (over.has(circle)) return;
            circle.color = [0.2, 0.2, 0.2, 1];
          });
        },

        onMouseOut: (_info: IPickInfo<CircleInstance>) => {
          this.circles.forEach((circle, i) => {
            circle.color = this.makeColor(i);
          });
        }
      }),
      createLayer(RectangleLayer, {
        data: this.providers.rectangles,
        key: "rects",
        scene: "default",
        scaleFactor: () => this.camera.scale[0]
      }),
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
    const bounds = await this.getViewScreenBounds();
    if (!bounds) return;

    this.center = new CircleInstance({
      center: [bounds.width / 2, bounds.height / 2],
      radius: 10,
      color: [1, 1, 1, 1]
    });

    this.providers.circles.add(this.center);

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeNode();
    }

    this.layout();
  }

  labelReady = (label: LabelInstance) => {
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

      const rect = this.lblToRect.get(label);

      if (rect) {
        rect.width = label.size[0];
        rect.height = label.size[1];
      }
    });
  };

  /**
   * Makes a circle and stores it in our circles array and adds it to the rendering
   */
  makeNode(preload?: boolean, txt?: string) {
    const words = [];
    words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);

    const node = new CircleInstance({
      center: [0, 0],
      radius: 10,
      color: [1, 1, 1, 1]
    });

    this.providers.circles.add(node);
    this.circles.push(node);

    const edge = new EdgeInstance({
      widthStart: 8,
      widthEnd: 1,
      start: [0, 0],
      end: [0, 0]
    });

    this.providers.edges.add(edge);
    this.edges.push(edge);

    const rect = new RectangleInstance({
      anchor: {
        type: AnchorType.TopLeft,
        padding: 0
      },
      color: [0.5, 0.5, 0.5, 1],
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    // this.providers.rectangles.add(rect);
    this.rectangles.push(rect);

    const label = new LabelInstance({
      origin: [20, this.parameters.fontSize * this.labels.length],
      color: [1, 1, 1, 0.0],
      text: txt !== undefined ? txt : words.join(" "),
      fontSize: this.parameters.fontSize,
      onReady: this.labelReady,
      preload
    });

    this.providers.labels.add(label);
    this.labels.push(label);
  }

  makeColor(i: number): Vec4 {
    const c = hsl(360 * i / this.circles.length, 100, 0.5).rgb();
    return [c.r / 255, c.g / 255, c.b / 255, 1.0];
  }

  layout() {
    const distance = 200;

    nextFrame(() => {
      this.circles.forEach((circle, i) => {
        circle.center = add2(
          [
            Math.cos(i / this.circles.length * Math.PI * 2) * distance,
            Math.sin(i / this.circles.length * Math.PI * 2) * distance
          ],
          this.center.center
        );

        circle.color = this.makeColor(i);
      });

      this.edges.forEach((edge, i) => {
        edge.start = copy2(this.center.center);
        edge.end = copy2(this.circles[i].center);
        edge.colorStart = copy4(this.center.color);
        edge.colorStart[3] = 0.2;
        edge.colorEnd = copy4(this.circles[i].color);
        edge.colorEnd[3] = 0.2;
      });

      this.rectangles.forEach((rect, i) => {
        rect.x = this.circles[i].center[0];
        rect.y = this.circles[i].center[1];
        rect.width = this.labels[i].size[0];
        rect.height = this.labels[i].size[1];
        this.lblToRect.set(this.labels[i], rect);
      });

      this.labels.forEach((lbl, i) => {
        const angle = i / this.circles.length * Math.PI * 2;
        lbl.origin = copy2(this.circles[i].center);

        if (angle > Math.PI / 2 && angle < Math.PI * 3 / 2) {
          lbl.anchor = {
            // type: AnchorType.TopLeft,
            // padding: 0
            type: AnchorType.MiddleRight,
            padding: this.circles[i].radius + 2
          };
        } else {
          lbl.anchor = {
            // type: AnchorType.TopLeft,
            // padding: 0
            type: AnchorType.MiddleLeft,
            padding: this.circles[i].radius + 2
          };
        }
      });
    });
  }

  /**
   * Remove a circle fromt he rendering
   */
  removeNode() {
    const label = this.labels.pop();
    const circle = this.circles.pop();
    const edge = this.edges.pop();
    const rect = this.rectangles.pop();

    if (label) this.providers.labels.remove(label);
    if (circle) this.providers.circles.remove(circle);
    if (edge) this.providers.edges.remove(edge);
    if (rect) this.providers.rectangles.remove(rect);
  }

  /**
   * Respond to window resizes
   */
  resize() {
    // NOOP
  }
}
