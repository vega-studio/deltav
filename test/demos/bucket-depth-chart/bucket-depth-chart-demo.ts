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

  buildConsole(_gui: datGUI.GUI): void {
    //
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
      chartData: data
    });

    bdc.insertToProvider(this.providers.blocks);
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
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
