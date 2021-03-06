import { hsl } from "d3-color";
import * as datGUI from "dat.gui";
import {
  add2,
  AnchorType,
  ArcInstance,
  ArcLayer,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  compare4,
  copy2,
  copy4,
  createLayer,
  createView,
  EasingUtil,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  InstanceProvider,
  IPickInfo,
  LabelInstance,
  LabelLayer,
  nextFrame,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  Size,
  Vec4,
  View2D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { debounce } from "../../common/debounce";
import { DEFAULT_RESOURCES, WORDS } from "../../types";

/**
 * A demo demonstrating particles collecting within the bounds of text.
 */
export class NodesEdges extends BaseDemo {
  circles: CircleInstance[] = [];
  edges: EdgeInstance[] = [];
  labels: LabelInstance[] = [];
  rectangles: RectangleInstance[] = [];
  lblToRect = new Map<LabelInstance, RectangleInstance>();
  center: CircleInstance;
  boundsView: RectangleInstance;

  /** Surface providers */
  providers = {
    arcs: new InstanceProvider<ArcInstance>(),
    circles: new InstanceProvider<CircleInstance>(),
    edges: new InstanceProvider<EdgeInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  /** Arcs used to animate hover */
  arcs: ArcInstance[] = [
    new ArcInstance({
      angle: [0, Math.PI / 2],
      colorEnd: [1, 1, 1, 1],
      colorStart: [1, 1, 1, 1],
      center: [0, 0],
      thickness: [2, 2],
      radius: 15
    }),
    new ArcInstance({
      angle: [-Math.PI, -Math.PI / 2],
      colorEnd: [1, 1, 1, 1],
      colorStart: [1, 1, 1, 1],
      center: [0, 0],
      thickness: [2, 2],
      radius: 15
    })
  ];

  /** GUI properties */
  parameters = {
    count: 10,
    fontSize: 14,
    scaleMode: ScaleMode.BOUND_MAX,

    circleRadius: 200,
    nodeRadius: 10,

    previous: {
      count: 10
    }
  };

  viewSize: Size;

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

    parameters.add(this.parameters, "nodeRadius", 4, 500, 1).onChange(
      debounce(async (_value: number) => {
        this.layout();
      }, 250)
    );

    parameters.add(this.parameters, "circleRadius", 4, 5000, 1).onChange(
      debounce(async (_value: number) => {
        this.layout();
      }, 250)
    );

    parameters.add(this.parameters, "scaleMode", {
      Always: ScaleMode.ALWAYS,
      BoundMax: ScaleMode.BOUND_MAX,
      Never: ScaleMode.NEVER
    });
  }

  adjustBounds() {
    // TODO: Bounds have gotten screwy with all of the  recent fixes that have taken place
    // if (!this.surface) return;
    // const controller = this.surface.eventManagers.main;
    // const worldBounds = new Bounds({
    //   x:
    //     -this.parameters.circleRadius -
    //     this.parameters.nodeRadius +
    //     this.center.center[0],
    //   y:
    //     -this.parameters.circleRadius -
    //     this.parameters.nodeRadius +
    //     this.center.center[1],
    //   width: this.parameters.circleRadius * 2 + this.parameters.nodeRadius * 2,
    //   height: this.parameters.circleRadius * 2 + this.parameters.nodeRadius * 2
    // });
    // const minScale = Math.min(
    //   this.viewSize[0] / worldBounds.width,
    //   this.viewSize[1] / worldBounds.height
    // );
    // controller.setBounds({
    //   anchor: CameraBoundsAnchor.MIDDLE,
    //   scaleMax: [9999, 9999, 9999],
    //   scaleMin: [minScale, minScale, minScale],
    //   screenPadding: {
    //     bottom: 40,
    //     left: 40,
    //     right: 40,
    //     top: 40
    //   },
    //   view: "default-view",
    //   worldBounds
    // });
    // if (controller.bounds && this.boundsView) {
    //   this.boundsView.position = [
    //     controller.bounds.worldBounds.x,
    //     controller.bounds.worldBounds.y
    //   ];
    //   this.boundsView.size = [
    //     controller.bounds.worldBounds.width,
    //     controller.bounds.worldBounds.height
    //   ];
    // }
  }

  handleCircleOver = (info: IPickInfo<CircleInstance>) => {
    const over = new Set();
    info.instances.forEach(circle => {
      over.add(circle);

      this.arcs.forEach(arc => {
        arc.center = copy2(circle.center);
        arc.radius = circle.radius + 4;
        arc.angleOffset = 0;

        nextFrame(() => {
          EasingUtil.all(
            true,
            [arc],
            [ArcLayer.attributeNames.angleOffset],
            easing => {
              easing.setStart([0]);
              arc.angleOffset = Math.PI * 2;
            }
          );
        });

        this.providers.arcs.add(arc);
      });
    });

    this.circles.forEach(circle => {
      if (over.has(circle)) return;

      if (!compare4(circle.color, [0.2, 0.2, 0.2, 1])) {
        circle.color = [0.2, 0.2, 0.2, 1];
      }
    });
  };

  handleCircleOut = (_info: IPickInfo<CircleInstance>) => {
    this.circles.forEach((circle, i) => {
      circle.color = this.makeColor(i);
    });

    this.arcs.forEach(arc => {
      this.providers.arcs.remove(arc);
    });
  };

  handleCircleClick = (info: IPickInfo<CircleInstance>) => {
    const focus = info.instances.find(circle => Boolean(circle.center));
    if (!focus || !this.surface) return;
    this.surface.cameras.main.control2D.animation = AutoEasingMethod.easeInOutCubic(
      1000
    );
    this.surface.eventManagers.main.centerOn(info.projection.id, [
      focus.center[0],
      focus.center[1],
      0
    ]);
  };

  /**
   * Establishes the render pipeline
   */
  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.view"],
          wheelShouldScroll: false
        })
      }),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            view: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            arcs: createLayer(ArcLayer, {
              animate: {
                angleOffset: AutoEasingMethod.linear(
                  1000,
                  0,
                  AutoEasingLoopStyle.REPEAT
                )
              },
              data: providers.arcs
            }),
            edges: createLayer(EdgeLayer, {
              animate: {
                startColor: AutoEasingMethod.easeInOutCubic(500),
                endColor: AutoEasingMethod.easeInOutCubic(500)
              },
              data: providers.edges,
              type: EdgeType.LINE
            }),
            circles: createLayer(CircleLayer, {
              animate: {
                color: AutoEasingMethod.easeInOutCubic(1000, 0)
              },
              data: providers.circles,
              picking: PickType.SINGLE,

              onMouseOver: this.handleCircleOver,
              onMouseOut: this.handleCircleOut,
              onMouseClick: this.handleCircleClick
            }),
            rects: createLayer(RectangleLayer, {
              data: providers.rectangles,
              scaleFactor: () => cameras.main.scale[0]
            }),
            labels: createLayer(LabelLayer, {
              animate: {
                color: AutoEasingMethod.easeInOutCubic(500)
              },
              data: providers.labels,
              resourceKey: resources.font.key,
              scaleMode: Number.parseFloat(`${this.parameters.scaleMode}`)
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
    if (!this.surface) return;
    await this.surface.ready;
    const bounds = this.surface.getViewScreenBounds("main.view");
    this.viewSize = [bounds.width, bounds.height];

    this.center = new CircleInstance({
      center: [bounds.width / 2, bounds.height / 2],
      radius: 10,
      color: [1, 1, 1, 1]
    });

    this.boundsView = new RectangleInstance({
      anchor: {
        type: AnchorType.TopLeft,
        padding: 0
      },
      position: [0, 0],
      size: [1, 1],
      color: [1, 1, 1, 0.2],
      depth: -200
    });

    // Uncomment this to see the bounds used for the camera
    this.providers.rectangles.add(this.boundsView);
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
        rect.size = [label.size[0], label.size[1]];
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
      radius: this.parameters.nodeRadius,
      color: [1, 1, 1, 1]
    });

    this.providers.circles.add(node);
    this.circles.push(node);

    const edge = new EdgeInstance({
      thickness: [8, 1],
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
      position: [0, 0],
      size: [0, 0]
    });

    // this.providers.rectangles.add(rect);
    this.rectangles.push(rect);

    const label = new LabelInstance({
      origin: [20, this.parameters.fontSize * this.labels.length],
      color: [1, 1, 1, 0.0],
      text: txt !== undefined ? txt : words.join(" "),
      fontSize: this.parameters.fontSize,
      onReady: this.labelReady,
      maxScale: 0.5,
      preload
    });

    this.providers.labels.add(label);
    this.labels.push(label);
  }

  makeColor(i: number): Vec4 {
    const c = hsl((360 * i) / this.circles.length, 100, 0.5).rgb();
    return [c.r / 255, c.g / 255, c.b / 255, 1.0];
  }

  layout() {
    const distance = this.parameters.circleRadius;

    nextFrame(() => {
      this.circles.forEach((circle, i) => {
        circle.center = add2(
          [
            Math.cos((i / this.circles.length) * Math.PI * 2) * distance,
            Math.sin((i / this.circles.length) * Math.PI * 2) * distance
          ],
          this.center.center
        );

        circle.color = this.makeColor(i);
        circle.radius = this.parameters.nodeRadius;
      });

      this.edges.forEach((edge, i) => {
        edge.start = copy2(this.center.center);
        edge.end = copy2(this.circles[i].center);
        edge.startColor = copy4(this.center.color);
        edge.endColor = copy4(this.circles[i].color);
        edge.startColor[3] = 0.2;
        edge.endColor[3] = 0.2;
      });

      this.rectangles.forEach((rect, i) => {
        rect.position = [this.circles[i].center[0], this.circles[i].center[1]];
        rect.size = [this.labels[i].size[0], this.labels[i].size[1]];
        this.lblToRect.set(this.labels[i], rect);
      });

      this.labels.forEach((lbl, i) => {
        const angle = (i / this.circles.length) * Math.PI * 2;
        lbl.origin = copy2(this.circles[i].center);

        if (angle > Math.PI / 2 && angle < (Math.PI * 3) / 2) {
          lbl.anchor = {
            type: AnchorType.MiddleRight,
            padding: this.circles[i].radius + 4
          };
        } else {
          lbl.anchor = {
            type: AnchorType.MiddleLeft,
            padding: this.circles[i].radius + 4
          };
        }
      });
    });

    this.adjustBounds();
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
