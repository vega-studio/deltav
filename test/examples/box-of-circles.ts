import { BasicCameraController, Bounds, ChartCamera, CircleInstance, CircleLayer, createLayer, DataProvider, EventManager, LayerInitializer } from '../../src';
import { AutoEasingMethod } from '../../src/voidgl/util/auto-easing-method';
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
      animate: {
        center: AutoEasingMethod.easeOutCubic(1000, 500),
      },
      data: provider,
      key: 'box-of-circles',
      scaleFactor: () => this.camera.scale[0],
      scene: scene,
    });
  }

  makeProvider(): DataProvider<CircleInstance> {
    const circleProvider = new DataProvider<CircleInstance>([]);
    const circles: CircleInstance[] = [];
    const boxSide = 100;

    for (let i = 0; i < boxSide; ++i) {
      for (let k = 0; k < boxSide; ++k) {
        const circle = new CircleInstance({
          color: [1.0, 0.0, 0.0, 1.0],
          id: `circle${i * 100 + k}`,
          radius: 5,
          x: i * 11,
          y: k * 11,
        });

        circleProvider.instances.push(circle);
        circles.push(circle);
      }
    }

    let makeBox = true;

    setInterval(() => {
      makeBox = !makeBox;

      if (makeBox) {
        for (let i = 0; i < boxSide; ++i) {
          for (let k = 0; k < boxSide; ++k) {
            const circle = circles[i * boxSide + k];
            circle.x = i * 11;
            circle.y = k * 11;
          }
        }
      }

      else {
        const size = boxSide * 11;
        circles.forEach(c => {
          c.x = Math.random() * size;
          c.y = Math.random() * size;
        });
      }
    }, 4000);

    return circleProvider;
  }
}
