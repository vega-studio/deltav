import { BasicCameraController, Bounds, ChartCamera, CircleInstance, CircleLayer, createLayer, EventManager, IInstanceProvider, InstanceProvider, LayerInitializer, LayerSurface, Vec, Vec2 } from '../../src';
import { AutoEasingMethod, IAutoEasingMethod } from '../../src/voidgl/util/auto-easing-method';
import { BaseExample } from './base-example';

function getColorIndicesForCoord(x: number, y: number, width: number) {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
}

function makeTextPositions(surface: LayerSurface, view: string) {
  const viewBounds = surface.getViewSize(view);
  if (!viewBounds) return [];
  const canvas = document.createElement('canvas').getContext('2d');
  if (!canvas) return [];

  const { min, max } = Math;

  let width = (canvas.canvas.width = viewBounds.width - 10);
  let height = (canvas.canvas.height = 80);
  canvas.fillStyle = 'white';
  canvas.font = '40px Consolas';
  canvas.fillText('Vega Animation', 0, 40, viewBounds.width - 10);

  const pixels = canvas.getImageData(
    0,
    0,
    width,
    height,
  );

  const imageData = pixels.data;
  width = pixels.width;
  height = pixels.height;

  let r, g, b, a;
  let minY = Number.MAX_SAFE_INTEGER;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  const xyBucket: Vec2[] = [];

  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      const indices = getColorIndicesForCoord(x, y, width);
      r = imageData[indices[0]];
      g = imageData[indices[1]];
      b = imageData[indices[2]];
      a = imageData[indices[3]];

      if (r > 0 || g > 0 || b > 0 || a > 0) {
        minY = min(minY, y);
        minX = min(minX, x);
        maxX = max(maxX, x);
        maxY = max(maxY, y);
        xyBucket.push([x, y]);
      }
    }
  }

  const textWidth = maxX - minX;
  const textHeight = maxY - minY;
  const left = (viewBounds.width - textWidth) / 2;
  const top = (viewBounds.height - textHeight) / 2;

  xyBucket.forEach((xy: Vec2) => {
    xy[0] -= minX;
    xy[1] -= minY;
    xy[0] += left;
    xy[1] += top;
  });

  return xyBucket;
}

export class BoxOfCircles extends BaseExample {
  camera: ChartCamera;
  scene: string;
  manager: BasicCameraController;
  originalRange: Bounds;
  animationControl: {
    center: IAutoEasingMethod<Vec>,
    color: IAutoEasingMethod<Vec>,
    radius: IAutoEasingMethod<Vec>,
  };
  textPositions: Vec2[];

  keyEvent(e: KeyboardEvent, isDown: boolean) {
    if (!this.originalRange) {
      this.originalRange = this.manager.getRange(this.scene);
    }

    if (e.shiftKey) {
      this.manager.setRange(new Bounds({ x: 20, y: 20, width: 20, height: 20 }), this.scene);
    }

    else {
      this.manager.setRange(this.originalRange, this.scene);
      delete this.originalRange;
    }
  }

  makeCamera(defaultCamera: ChartCamera) {
    this.camera = defaultCamera;
    return defaultCamera;
  }

  makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager {
    this.scene = viewName;

    this.manager = new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
    });

    return this.manager;
  }

makeLayer(scene: string, atlas: string, provider: IInstanceProvider<CircleInstance>): LayerInitializer {
    this.animationControl = {
      center: AutoEasingMethod.easeOutElastic(1000, 500),
      color: AutoEasingMethod.linear(500, 1500),
      radius: AutoEasingMethod.linear(500, 1500),
    };

    return createLayer(CircleLayer, {
      animate: this.animationControl,
      data: provider,
      key: 'box-of-circles',
      scaleFactor: () => this.camera.scale[0],
      scene: scene,
    });
  }

  private async moveToText(circles: CircleInstance[]) {
    const xy = this.textPositions || makeTextPositions(this.surface, this.view);
    this.textPositions = xy;
    const bucketLength = xy.length;
    const toProcess = circles.slice(0);
    let i = 0;
    circles.sort((a, b) => b.x - a.x);

    while (toProcess.length > 0) {
      const circle = toProcess.splice(Math.floor(Math.random() * toProcess.length), 1)[0];

      if (circle) {
        setTimeout(() => {
          const pos = xy[i % bucketLength];
          circle.x = pos[0];
          circle.y = pos[1];
          ++i;
        }, Math.floor(i / 10));
      }
    }
  }

  makeProvider(): IInstanceProvider<CircleInstance> {
    const circleProvider = new InstanceProvider<CircleInstance>();
    const circles: CircleInstance[] = [];
    const boxSide = 100;

    for (let i = 0; i < boxSide; ++i) {
      for (let k = 0; k < boxSide; ++k) {
        const circle = new CircleInstance({
          color: [1.0, 0.0, 0.0, 1.0],
          id: `circle${i * 100 + k}`,
          radius: 2,
          x: i * 4,
          y: k * 4,
        });

        circles.push(circle);
        circleProvider.add(circle);
      }
    }

    let makeBox = true;
    const { random } = Math;

    setInterval(() => {
      makeBox = !makeBox;

      if (makeBox) {
        this.animationControl.center.delay = 1500;
        this.animationControl.color.delay = 500;
        this.animationControl.radius.delay = 1500;

        for (let i = 0; i < boxSide; ++i) {
          for (let k = 0; k < boxSide; ++k) {
            const circle = circles[i * boxSide + k];
            circle.x = i * 4;
            circle.y = k * 4;
            circle.radius = 2;
            circle.color = [1.0, 0.0, 0.0, 1.0];
          }
        }
      }

      else {
        this.animationControl.center.delay = 500;
        this.animationControl.color.delay = 1500;
        this.animationControl.radius.delay = 500;

        this.moveToText(circles);

        circles.forEach(c => {
          c.radius = 1;
          c.color = [random(), random(), 1.0, 1.0];
        });
      }
    }, 4000);

    return circleProvider;
  }
}
