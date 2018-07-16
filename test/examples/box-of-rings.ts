import {
  ChartCamera,
  createLayer,
  DataProvider,
  LayerInitializer,
  RingInstance,
  RingLayer
} from "../../src";
import { BaseExample } from "./base-example";

export class BoxOfRings extends BaseExample {
  camera: ChartCamera;

  makeCamera(defaultCamera: ChartCamera) {
    this.camera = defaultCamera;
    return defaultCamera;
  }

  makeLayer(
    scene: string,
    _atlas: string,
    provider: DataProvider<RingInstance>
  ): LayerInitializer {
    return createLayer(RingLayer, {
      data: provider,
      key: "box-of-rings",
      scaleFactor: () => this.camera.scale[0],
      scene: scene
    });
  }

  makeProvider(): DataProvider<RingInstance> {
    const ringProvider = new DataProvider<RingInstance>([]);

    /*setInterval(() => {
      if (ringProvider.instances.length) {
        ringProvider.instances.pop();
      } else {
        for (let i = 0; i < 25; ++i) {
          for (let k = 0; k < 25; ++k) {
            ringProvider.instances.push(
              new RingInstance({
                color: [Math.random(), Math.random(), Math.random(), 1.0],
                id: `ring_${i}_${k}`,
                radius: 10,
                thickness: 1,
                x: i * 20,
                y: k * 20
              })
            );
          }
        }
      }
    }, 1000 / 60);*/

    for (let k = 0; k < 25; ++k) {
      ringProvider.instances.push(
        new RingInstance({
          color: [1, 1, 1, 1.0],
          id: `ring_${k}`,
          radius: 80 * (k + 1),
          thickness: 5 * (k + 1),
          x: 400,
          y: 400
        })
      );
    }

    return ringProvider;
  }
}
