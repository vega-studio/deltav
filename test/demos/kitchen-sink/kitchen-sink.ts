import {
  BasicSurface,
  Camera2D,
  ClearFlags,
  createView,
  EventManager,
  IInstanceProvider,
  InstanceProvider,
  ISceneOptions,
  LayerInitializer,
  Vec4,
  View2D
} from "../../../src";

import * as datGUI from "dat.gui";
import { BaseDemo } from "../../common/base-demo";

import { Blending } from "../../demos/kitchen-sink/examples/blending";
import { DEFAULT_RESOURCES } from "../../types";
import { AnimateDeleteAdd } from "./examples/animate-delete-add";
import { Arcs } from "./examples/arcs";
import { BaseExample } from "./examples/base-example";
import { BendyEdge } from "./examples/bendy-edge";
import { BoundedView } from "./examples/bounded-view";
import { BoundedView3 } from "./examples/bounded-view3";
import { BoxOfCircles } from "./examples/box-of-circles";
import { BoxOfRings } from "./examples/box-of-rings";
import { ChangingAnchorLabels } from "./examples/changing-anchor-labels";
import { Images } from "./examples/images";
import { LabelAnimatedScale } from "./examples/label-animated-scale";
import { LabelSizingCorrected } from "./examples/label-sizing-corrected";
import { Lines } from "./examples/lines";
import { MouseInteraction } from "./examples/mouse-interaction";
import { MouseInteractionColorPicking } from "./examples/mouse-interaction-color-picking";
import { MouseInteractionEdges } from "./examples/mouse-interaction-edges";
import { MouseInteractionImages } from "./examples/mouse-interaction-images";
import { MouseInteractionLabels } from "./examples/mouse-interaction-labels";
import { MouseInteractionRectangle } from "./examples/mouse-interaction-rectangle";
import { ScreenSpaceEdges } from "./examples/screen-space-edges";
import { SingleAxisLabelScaling } from "./examples/single-axis-label-scaling";
import { VertexAttributePacking } from "./examples/vertex-attribute-packing";

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

function makeDemos() {
  return [
    new BoxOfRings(),
    new BoxOfCircles(),
    new ScreenSpaceEdges(),
    new ChangingAnchorLabels(),
    new Images(),
    new BendyEdge(),
    new Lines(),
    new MouseInteraction(),
    new SingleAxisLabelScaling(),
    new SingleAxisLabelScaling(true),
    new SingleAxisLabelScaling(false),
    new MouseInteractionLabels(),
    new MouseInteractionImages(),
    new MouseInteractionEdges(),
    new LabelAnimatedScale(),
    new LabelSizingCorrected(),
    new MouseInteractionRectangle(),
    new BoundedView(),
    new BoundedView3(),
    new AnimateDeleteAdd(),
    new MouseInteractionColorPicking(),
    new Arcs(),
    new VertexAttributePacking(),
    new VertexAttributePacking(true),
    new Blending()
  ];
}

/** These are all of the tests to be rendered */
let tests: BaseExample[] = makeDemos();
/** These are the layers for the tests that are generated */
let layers: LayerInitializer[] = [];

function isLayerInitializerList(val: any): val is LayerInitializer[] {
  return Array.isArray(val);
}

/**
 * Entry class for the Application
 */
export class KitchenSink extends BaseDemo {
  /** This is all of the scenes that were initialized */
  allScenes: SceneInitializer[];

  testControls = new Map<
    BaseExample,
    {
      provider: IInstanceProvider<any>;
    }
  >();

  buildConsole(_gui: datGUI.GUI) {
    //  TODO
  }

  destroy() {
    super.destroy();
    tests.forEach(test => test.destroy());
    tests = makeDemos();
    layers = [];
    this.testControls.clear();
    delete this.allScenes;
  }

  private makeSceneControls() {
    if (!this.allScenes) {
      let blockSize = 1;
      while (blockSize * blockSize < tests.length) blockSize++;

      const scenes = this.makeSceneBlock(blockSize);
      this.allScenes = scenes;
    }

    return this.allScenes;
  }

  private getEventManagers() {
    return this.makeSceneControls().map(init => init.control);
  }

  /**
   * Establish the render pipeline
   */
  makeSurface(container: HTMLElement) {
    const scenes = this.getScenes();

    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: {},
      resources: {
        atlas: DEFAULT_RESOURCES.atlas,
        font: DEFAULT_RESOURCES.font
      },
      cameras: {},
      eventManagers: () => this.getEventManagers(),
      scenes: () => ({
        ...scenes
      })
    });
  }

  /**
   * Generate the scenes to be used by the kitchen sink
   */
  private getScenes() {
    return this.makeSceneControls().map(init => init.scene);
  }

  /**
   * Populate the scenes with the layers the tests provide
   */
  private getLayers(fakeProvider?: boolean) {
    this.makeSceneControls();

    // Generate the Layers for the tests now that the scenes are established
    tests.forEach((test, i) => {
      if (!this.surface) return;
      layers = [];
      const controls = this.testControls.get(test);
      const scene = this.allScenes[i];
      const sceneName = this.allScenes[i].name;
      // test.surface = this.surface.surface;
      test.view = sceneName;

      const layer = test.makeLayer(
        {
          atlas: this.surface.resources.atlas.key,
          font: this.surface.resources.font.key
        },
        fakeProvider || !controls ? new InstanceProvider() : controls.provider
      );

      if (isLayerInitializerList(layer)) {
        layer.forEach(l => layers.push(l));
      } else {
        layers.push(layer);
      }

      scene.scene.layers = layers;
    });
  }

  handleKeyDown = (e: KeyboardEvent) => {
    tests.forEach(test => test.keyEvent(e, true));
  };

  handleKeyUp = (e: KeyboardEvent) => {
    tests.forEach(test => test.keyEvent(e, false));
  };

  makeSceneBlock(sceneBlockSize: number) {
    const scenes: SceneInitializer[] = [];
    const viewSize = 100 / sceneBlockSize;

    const backgrounds: Vec4[] = [
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
        const camera = new Camera2D();
        const test = tests[++testIndex];

        if (test) {
          const testCamera = test.makeCamera(camera);

          const init: SceneInitializer = {
            control: test.makeController(
              camera,
              testCamera,
              `${testIndex}.${name}`
            ),
            name: `${testIndex}.${name}`,
            scene: {
              key: name,
              views: [
                createView(View2D, {
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
                })
              ],
              layers: []
            }
          };

          scenes.push(init);
        }
      }
    }

    return scenes;
  }

  async init() {
    if (!this.surface) return;
    const surface = await this.surface.ready;

    tests.forEach(test => {
      if (!surface.base) return;
      test.surface = surface.base;
      this.testControls.set(test, {
        provider: test.makeProvider()
      });
    });

    this.getLayers();
    this.surface.updatePipeline();
  }
}
