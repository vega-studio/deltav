import {
  ChartCamera,
  ClearFlags,
  EventManager,
  IInstanceProvider,
  ISceneOptions,
  LayerInitializer
} from "src";

import * as datGUI from "dat.gui";
import { BaseDemo } from "../common/base-demo";

import { Blending } from "test/kitchen-sink/examples/blending";
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
import { LabelAnchorsAndScales } from "./examples/label-anchors-and-scales";
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
  return Array.isArray(val) && Array.isArray(val[0]);
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
    tests.forEach(test => test.destroy());
    tests = makeDemos();
    layers = [];
    this.testControls.clear();
    delete this.allScenes;
  }

  makeSceneControls() {
    if (!this.allScenes) {
      let blockSize = 1;
      while (blockSize * blockSize < tests.length) blockSize++;

      const scenes = this.makeSceneBlock(blockSize);
      this.allScenes = scenes;
    }

    return this.allScenes;
  }

  getEventManagers() {
    return this.makeSceneControls().map(init => init.control);
  }

  getScenes() {
    return this.makeSceneControls().map(init => init.scene);
  }

  getLayers(): LayerInitializer[] {
    this.makeSceneControls();
    layers = [];

    // Generate the Layers for the tests now that the scenes are established
    tests.forEach((test, i) => {
      const controls = this.testControls.get(test);
      if (!controls) return;

      const sceneName = this.allScenes[i].name;
      // test.surface = this.surface.surface;
      test.view = sceneName;

      const layer = test.makeLayer(
        sceneName,
        { atlas: "atlas", font: "test-font" },
        controls.provider
      );

      if (isLayerInitializerList(layer)) {
        layer.forEach(l => layers.push(l));
      } else {
        layers.push(layer);
      }
    });

    return layers;
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

  async init() {
    const surface = await this.surface.surfaceReady;

    tests.forEach(test => {
      test.surface = surface;
      this.testControls.set(test, {
        provider: test.makeProvider()
      });
    });
  }
}
