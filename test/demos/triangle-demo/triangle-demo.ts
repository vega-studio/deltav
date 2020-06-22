import {
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  EdgeType,
  InstanceProvider,
  Vec2,
  View2D
} from "src";
import { BaseDemo } from "test/common/base-demo";

import { CircleInstance, CircleLayer } from "./circles";
import { EdgeInstance, EdgeLayer } from "./edges";
import { ScaleMode } from "./type";

export class TriangleDemo extends BaseDemo {
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    edges: new InstanceProvider<EdgeInstance>()
  };

  buildConsole() {
    // TODO
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container: container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {},
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.view"],
          wheelShouldScroll: false
        })
      }),
      scenes: (_resources, providers, cameras) => ({
        main: {
          views: {
            view: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            circles: createLayer(CircleLayer, {
              animate: {},
              data: providers.circles,
              scaleFactor: () => cameras.main.scale2D[1],
              scaleMode: ScaleMode.BOUND_MAX,
              maxScale: 3
            }),
            edges: createLayer(EdgeLayer, {
              animate: {},
              scaleFactor: () => cameras.main.scale2D[1],
              data: providers.edges,
              type: EdgeType.LINE,
              scaleMode: ScaleMode.BOUND_MAX,
              maxScale: 3
            })
          }
        }
      })
    });
  }

  async init() {
    const pos1: Vec2 = [100, 200];
    const pos2: Vec2 = [300, 400];
    const pos3: Vec2 = [400, 300];

    const circle1 = new CircleInstance({
      world: [0, 0],
      position: pos1,
      size: 10,
      color: [1, 0, 0, 1]
    });

    const circle2 = new CircleInstance({
      world: [0, 0],
      position: pos2,
      size: 10,
      color: [1, 0, 0, 1]
    });

    const circle3 = new CircleInstance({
      world: [0, 0],
      position: pos3,
      size: 10,
      color: [1, 0, 0, 1]
    });

    const edge1 = new EdgeInstance({
      world: [0, 0],
      position: [pos1, pos2],
      size: [10, 10],
      start: [0, 0],
      end: [0, 0]
    });

    const edge2 = new EdgeInstance({
      world: [0, 0],
      position: [pos1, pos3],
      size: [10, 10],
      start: [0, 0],
      end: [0, 0]
    });

    const edge3 = new EdgeInstance({
      world: [0, 0],
      position: [pos2, pos3],
      size: [10, 10],
      start: [0, 0],
      end: [0, 0]
    });

    this.providers.circles.add(circle1);
    this.providers.circles.add(circle2);
    this.providers.circles.add(circle3);
    this.providers.edges.add(edge1);
    this.providers.edges.add(edge2);
    this.providers.edges.add(edge3);
  }
}
