/** @jsx h */
import { Component, h, render } from "preact";
import { EventManager, ISceneOptions, LayerInitializer } from "../src";
import { LayerSurface } from "../src/voidgl/surface/layer-surface";
import { AtlasSize } from "../src/voidgl/surface/texture/atlas";
import { ClearFlags } from "../src/voidgl/surface/view";
import { ChartCamera } from "../src/voidgl/util/chart-camera";
import { BaseExample } from "./examples/base-example";
import { BendyEdge } from "./examples/bendy-edge";
import { BoundedView } from "./examples/bounded-view";
import { BoxOfCircles } from "./examples/box-of-circles";
import { BoxOfRings } from "./examples/box-of-rings";
import { ChangingAnchorLabels } from "./examples/changing-anchor-labels";
import { Images } from "./examples/images";
import { LabelAnchorsAndScales } from "./examples/label-anchors-and-scales";
import { LabelAnimatedScale } from "./examples/label-animated-scale";
import { LabelSizingCorrected } from "./examples/label-sizing-corrected";
import { Lines } from "./examples/lines";
import { MouseInteraction } from "./examples/mouse-interaction";
import { MouseInteractionEdges } from "./examples/mouse-interaction-edges";
import { MouseInteractionImages } from "./examples/mouse-interaction-images";
import { MouseInteractionLabels } from "./examples/mouse-interaction-labels";
import { MouseInteractionRectangle } from "./examples/mouse-interaction-rectangle";
import { ScreenSpaceEdges } from "./examples/screen-space-edges";
import { SingleAxisLabelScaling } from "./examples/single-axis-label-scaling";

/**
 * The state of the application
 */
export interface IMainState {
  size: { width: number; height: number };
}

export type SceneInitializer = {
  name: string;
  control: EventManager;
  scene: ISceneOptions;
};

/** These are all of the tests to be rendered */
const tests: BaseExample[] = [
  new BoxOfRings()
  /*new BoxOfCircles(),
  new ScreenSpaceEdges(),
  new ChangingAnchorLabels(),
  new LabelAnchorsAndScales(),
  new Images(),
  new BendyEdge(),
  new Lines(),
  new MouseInteraction(),
  new SingleAxisLabelScaling(true),
  new SingleAxisLabelScaling(false),
  new MouseInteractionLabels(),
  new MouseInteractionImages(),
  new MouseInteractionEdges(),
  new LabelAnimatedScale(),
  new LabelSizingCorrected(),
  new MouseInteractionRectangle(),
  new BoundedView()*/
];

/** These are the layers for the tests that are generated */
const layers: LayerInitializer[] = [];

/**
 * Entry class for the Application
 */
export class Main extends Component<any, IMainState> {
  /** The containing element of this component */
  container: HTMLElement;
  /** The rendering context we will draw into */
  context: HTMLCanvasElement;
  /** While true, the animation loop will run */
  willAnimate: number = 10;
  /** The layer manager that draws our GL elements */
  surface: LayerSurface;
  /** This is all of the scenes that were initialized */
  allScenes: SceneInitializer[] = [];
  /** Flagged to true when the surface shouldn't be auto generated */
  preventAutoCreateSurface: boolean = false;

  state: IMainState = {
    size: {
      height: 0,
      width: 0
    }
  };

  componentWillMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.container.removeEventListener("onkeypress", this.handleKeyDown);
    this.container.removeEventListener("onkeyup", this.handleKeyUp);
    this.surface && this.surface.destroy();
    this.willAnimate = 0;
  }

  componentDidUpdate() {
    if (!this.preventAutoCreateSurface) {
      this.createSurface();
    }
  }

  async createSurface() {
    let generate = false;

    if (this.surface && this.context !== this.surface.gl.canvas) {
      this.surface.destroy();
      generate = true;
    } else if (!this.surface) {
      generate = true;
    }

    if (generate) {
      this.context.removeAttribute("style");
      const scenes = this.makeSceneBlock(1);
      this.allScenes = scenes;

      // Establish the surface and scenes needed
      this.surface = await new LayerSurface().init({
        atlasResources: [
          {
            height: AtlasSize._2048,
            key: "all-resources",
            width: AtlasSize._2048
          },
          {
            height: AtlasSize._2048,
            key: "all-resources-2",
            width: AtlasSize._2048
          }
        ],
        background: [0.1, 0.2, 0.3, 1.0],
        context: this.context,
        eventManagers: scenes.map(init => init.control),
        handlesWheelEvents: true,
        scenes: scenes.map(init => init.scene)
      });

      // Generate the Layers for the tests now that the scenes are established
      tests.forEach((test, i) => {
        test.surface = this.surface;
        test.view = this.allScenes[i].name;
        const provider = test.makeProvider();
        const layer = test.makeLayer(
          this.allScenes[i].name,
          i % 2 === 0 ? "all-resources" : "all-resources",
          provider
        );
        layers.push(layer);
      });

      // Begin the draw loop
      this.willAnimate = 10;
      requestAnimationFrame((t: number) => this.draw(t));

      this.forceUpdate();
    }
  }

  draw(time: number) {
    if (this.willAnimate) {
      requestAnimationFrame((t: number) => this.draw(t));
    }

    if (this.surface) {
      this.surface.draw(time);
    }
  }

  handleForceResize = () => {
    const box = this.container.getBoundingClientRect();
    this.surface.resize(box.width, box.height, 1.0);
    setTimeout(() => {
      this.surface.resize(box.width, box.height, window.devicePixelRatio);
    }, 1);
  };

  handleKeyDown = (e: KeyboardEvent) => {
    tests.forEach(test => test.keyEvent(e, true));
  };

  handleKeyUp = (e: KeyboardEvent) => {
    tests.forEach(test => test.keyEvent(e, false));
  };

  handleResize = () => {
    if (this.surface) {
      this.surface.fitContainer();
    }
  };

  handleToggleMonitorDensity = () => {
    if (this.surface.pixelRatio !== 1.0) {
      this.surface.resize(
        this.context.width / window.devicePixelRatio,
        this.context.height / window.devicePixelRatio,
        1.0
      );
    } else {
      this.surface.resize(
        this.context.width * window.devicePixelRatio,
        this.context.height * window.devicePixelRatio,
        window.devicePixelRatio
      );
    }

    this.forceUpdate();
  };

  handleToggleSurface = async () => {
    if (this.surface) {
      this.surface.destroy();
      delete this.surface;
      this.context.style.width = "";
      this.context.style.height = "";
      this.context.removeAttribute("width");
      this.context.removeAttribute("height");
      this.preventAutoCreateSurface = true;
      this.sizeContext();
    } else {
      await this.createSurface();
      this.sizeContext();
    }
  };

  makeSceneBlock(sceneBlockSize: number) {
    const scenes: SceneInitializer[] = [];
    const viewSize = 100 / sceneBlockSize;

    const backgrounds: [number, number, number, number][] = [
      [0.1, 0.0, 0.0, 1.0],
      [0.0, 0.1, 0.0, 1.0],
      [0.0, 0.0, 0.1, 1.0],
      [0.1, 0.1, 0.0, 1.0],
      [0.1, 0.0, 0.1, 1.0],
      [0.1, 0.1, 0.1, 1.0],
      [0.0, 0.1, 0.1, 1.0]
    ];

    let testIndex = -1;

    for (let i = 0; i < sceneBlockSize && testIndex < tests.length + 1; ++i) {
      for (let k = 0; k < sceneBlockSize && testIndex < tests.length + 1; ++k) {
        const name = `${i}_${k}`;
        const camera = new ChartCamera();
        const test = tests[++testIndex];

        if (test) {
          const testCamera = test.makeCamera(camera);

          const init: SceneInitializer = {
            control: test.makeController(camera, testCamera, name),
            name,
            scene: {
              key: name,
              views: [
                {
                  background:
                    backgrounds[Math.floor(Math.random() * backgrounds.length)],
                  camera: testCamera,
                  clearFlags: [ClearFlags.COLOR],
                  key: name,
                  viewport: {
                    height: `${viewSize}%`,
                    left: `${viewSize * k}%`,
                    top: `${viewSize * i}%`,
                    width: `${viewSize}%`
                  }
                }
              ]
            }
          };

          scenes.push(init);
        }
      }
    }

    return scenes;
  }

  setContainer = (element: HTMLDivElement) => {
    this.container = element;
    setTimeout(() => this.sizeContext(), 100);
  };

  setContext = async (canvas: HTMLCanvasElement) => {
    this.context = canvas;
    document.onkeydown = this.handleKeyDown;
    document.onkeyup = this.handleKeyUp;
  };

  sizeContext() {
    const box = this.container.getBoundingClientRect();

    this.setState({
      size: {
        height: box.height,
        width: box.width
      }
    });
  }

  /**
   * @override
   * The React defined render method
   */
  render(): JSX.Element {
    const { size } = this.state;

    if (size.width === 0 || size.height === 0) {
      return (
        <div
          style={{ width: "100%", height: "100%" }}
          ref={this.setContainer}
        />
      );
    }

    if (this.surface) {
      this.surface.render(layers);
      this.surface.resize(size.width, size.height);
    }

    return (
      <div className="voidray-layer-surface" ref={this.setContainer}>
        <canvas ref={this.setContext} width={size.width} height={size.height} />
        {window.devicePixelRatio === 1.0 ? null : (
          <div
            className={"test-button"}
            onClick={this.handleToggleMonitorDensity}
          >
            {this.surface && this.surface.pixelRatio === window.devicePixelRatio
              ? "Disable Monitor Density"
              : "Enable Monitor Density"}
          </div>
        )}
        <div className={"remove-button"} onClick={this.handleToggleSurface}>
          {this.surface ? "Destroy Surface" : "Regen Surface"}
        </div>
        <div className={"remove-button"} onClick={this.handleForceResize}>
          Force Resize
        </div>
      </div>
    );
  }
}

render(<Main />, document.getElementById("main"));
