import * as datGUI from "dat.gui";
import {
  BasicSurface,
  BlockInstance,
  BlockLayer,
  Camera,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  Vec2,
  Vec4,
  View3D
} from "src";
import { BaseDemo } from "../../common/base-demo";
import { BucketDepthChart } from "./bucket-depth-chart";

export class BucketDepthChartDemo extends BaseDemo {
  providers = {
    blocks: new InstanceProvider<BlockInstance>()
  };

  front: boolean = false;

  parameters = {
    changeView: () => {
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;

      if (!this.front) {
        let i = 0;
        const timeId = setInterval(() => {
          i++;
          camera.position = [10 - i, 10 - i, 10];
          camera.lookAt([0, 0, 0], [0, 1, 0]);
          if (i >= 10) clearInterval(timeId);
        }, 100);
      } else {
        let i = 0;
        const timeId = setInterval(() => {
          i++;
          camera.position = [i, i, 10];
          camera.lookAt([0, 0, 0], [0, 1, 0]);
          if (i >= 10) clearInterval(timeId);
        }, 100);
      }

      this.front = !this.front;
    }
  };

  buildConsole(gui: datGUI.GUI): void {
    gui.add(this.parameters, "changeView");
  }

  async init() {
    if (!this.surface) return;

    // const transform = new Transform();
    const camera = this.surface.cameras.perspective;
    camera.position = [10, 10, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const data: Vec2[][] = [];

    for (let i = 0; i < 5; i++) {
      data[i] = [];
      for (let j = 0; j <= 10; j++) {
        const point: Vec2 = [j / 10, 3 + 2 * Math.random()];
        data[i].push(point);
      }
    }

    const colors: Vec4[] = [
      [1, 0, 0, 0.8],
      [0, 1, 0, 0.8],
      [0, 0, 1, 0.8],
      [1, 1, 0, 0.8],
      [0, 1, 1, 0.8]
    ];

    const bdc = new BucketDepthChart({
      maxDepth: 0,
      minDepth: -5,
      width: 10,
      heightScale: 0.3,
      colors,
      chartData: data,
      resolution: 9
    });

    bdc.insertToProvider(this.providers.blocks);
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      rendererOptions: {
        antialias: true
      },
      cameras: {
        perspective: Camera.makePerspective({
          fov: 80 * Math.PI / 180,
          far: 100000,
          width: window.innerWidth,
          height: window.innerHeight
        })
      },
      resources: {},
      eventManagers: _cameras => ({}),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              orthographic: createView(View3D, {
                camera: cameras.perspective,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              blocks: createLayer(BlockLayer, {
                data: providers.blocks
              })
            }
          }
        }
      })
    });
  }
}
