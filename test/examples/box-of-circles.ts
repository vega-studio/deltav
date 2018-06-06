import { BasicCameraController, Bounds, ChartCamera, CircleInstance, CircleLayer, createLayer, DataProvider, EventManager, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';

export class BoxOfCircles extends BaseExample {
  camera: ChartCamera;
  view: string;
  manager: BasicCameraController;
  originalRange: Bounds;

  keyEvent(e: KeyboardEvent, isDown: boolean) {
    if (!this.originalRange) {
      this.originalRange = this.manager.getRange(this.view);
    }

    if (e.shiftKey) {
      this.manager.setRange(new Bounds({ x: 20, y: 20, width: 20, height: 20 }), this.view);
    }

    else {
      this.manager.setRange(this.originalRange, this.view);
      delete this.originalRange;
    }
  }

  makeCamera(defaultCamera: ChartCamera) {
    this.camera = defaultCamera;
    return defaultCamera;
  }

  makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager {
    this.view = viewName;

    this.manager = new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
    });

    return this.manager;
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer {
    return createLayer(CircleLayer, {
      data: provider,
      key: 'box-of-circles',
      scaleFactor: () => this.camera.scale[0],
      scene: scene,
    });
  }

  makeProvider(): DataProvider<CircleInstance> {
    const circleProvider = new DataProvider<CircleInstance>([]);

    for (let i = 0; i < 25; ++i) {
      for (let k = 0; k < 25; ++k) {
        const circle = new CircleInstance({
          color: [1.0, 0.0, 0.0, 1.0],
          id: `circle${i * 100 + k}`,
          radius: 5,
          x: i * 11,
          y: k * 11,
        });

        circleProvider.instances.push(circle);
      }
    }

    return circleProvider;
  }
}
