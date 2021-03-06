import {
  AutoEasingMethod,
  BasicCamera2DController,
  Bounds,
  Camera2D,
  CircleInstance,
  CircleLayer,
  createLayer,
  EventManager,
  IAutoEasingMethod,
  IInstanceProvider,
  InstanceProvider,
  LayerInitializer,
  Surface,
  Vec,
  Vec2
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

const { min, max, random } = Math;

function getColorIndicesForCoord(x: number, y: number, width: number) {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
}

function makeTextPositions(surface: Surface, view: string) {
  const viewBounds = surface.getViewSize(view);
  if (!viewBounds) return [];
  const canvas = document.createElement("canvas").getContext("2d");
  if (!canvas) return [];

  let width = (canvas.canvas.width = viewBounds.width - 10);
  let height = (canvas.canvas.height = 80);
  canvas.fillStyle = "white";
  canvas.font = "40px Consolas";
  canvas.fillText("Vega Animation", 0, 40, viewBounds.width - 10);

  const pixels = canvas.getImageData(0, 0, width, height);

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
  const left = Math.floor((viewBounds.width - textWidth) / 2);
  const top = Math.floor((viewBounds.height - textHeight) / 2);

  xyBucket.forEach((xy: Vec2) => {
    xy[0] -= minX;
    xy[1] -= minY;
    xy[0] += left;
    xy[1] += top;
  });

  return xyBucket;
}

export class BoxOfCircles extends BaseExample {
  animationControl: {
    center: IAutoEasingMethod<Vec>;
    color: IAutoEasingMethod<Vec>;
    radius: IAutoEasingMethod<Vec>;
  };
  camera: Camera2D;
  manager: BasicCamera2DController;
  originalRange: Bounds<never>;
  scene: string;
  textPositions: Vec2[];
  textCache: {
    buckets: CircleInstance[][];
    xy: Vec2[];
  };

  keyEvent(e: KeyboardEvent, _isDown: boolean) {
    if (!this.originalRange) {
      this.originalRange = this.manager.getRange(this.scene);
    }

    if (e.shiftKey) {
      this.manager.setRange(
        new Bounds({ x: 20, y: 20, width: 20, height: 20 }),
        this.scene
      );
    } else {
      this.manager.setRange(this.originalRange, this.scene);
      delete this.originalRange;
    }
  }

  makeCamera(defaultCamera: Camera2D) {
    this.camera = defaultCamera;
    return defaultCamera;
  }

  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ): EventManager {
    this.scene = viewName;

    this.manager = new BasicCamera2DController({
      camera: defaultCamera,
      startView: viewName
    });

    return this.manager;
  }

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<CircleInstance>
  ): LayerInitializer {
    this.animationControl = {
      center: AutoEasingMethod.easeBackOut(1000, 500),
      color: AutoEasingMethod.linear(500, 1500),
      radius: AutoEasingMethod.linear(500, 1500)
    };

    return createLayer(CircleLayer, {
      animate: this.animationControl,
      data: provider,
      key: "box-of-circles"
    });
  }

  private async moveToText(circles: CircleInstance[]) {
    if (!this.textCache) {
      const xy =
        this.textPositions || makeTextPositions(this.surface, this.view);
      this.textPositions = xy;

      if (this.textPositions.length === 0) {
        delete this.textPositions;
        return;
      }

      xy.sort((a, b) => a[0] - b[0]);
      const circleBuckets: CircleInstance[][] = [];
      const bucketLength = xy.length;
      const toProcess = circles.slice(0);
      let i = 0;

      while (toProcess.length > 0) {
        const circle = toProcess.splice(
          Math.floor(Math.random() * toProcess.length),
          1
        )[0];
        const index = i++ % bucketLength;
        const bucket = (circleBuckets[index] = circleBuckets[index] || []);
        bucket.push(circle);
      }

      this.textCache = {
        buckets: circleBuckets,
        xy
      };
    }

    const xy = this.textCache.xy;
    const circleBuckets = this.textCache.buckets;

    for (let i = 0, end = circleBuckets.length; i < end; ++i) {
      const bucket = circleBuckets[i];
      const pos = xy[i];

      for (let k = 0, end = bucket.length; k < end; ++k) {
        const circle = bucket[k];

        if (circle && pos) {
          circle.center = [pos[0], pos[1]];
          circle.radius = 0.5;
          circle.color = [random(), random(), 1.0, 1.0];

          const easing = circle.getEasing(CircleLayer.attributeNames.center);
          if (easing) {
            easing.setTiming(this.animationControl.center.delay + i * 2);
          }
        }
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
          center: [i * 4, k * 4]
        });

        circles.push(circle);
        circleProvider.add(circle);
      }
    }

    let makeBox = true;

    setInterval(() => {
      makeBox = !makeBox;

      if (makeBox) {
        this.animationControl.center.delay = 1500;
        this.animationControl.color.delay = 1000;
        this.animationControl.radius.delay = 1500;

        for (let i = 0; i < boxSide; ++i) {
          for (let k = 0; k < boxSide; ++k) {
            const circle = circles[i * boxSide + k];
            circle.center = [i * 4, k * 4];
            circle.radius = 2;
            circle.color = [1.0, 0.0, 0.0, 1.0];

            const easing = circle.getEasing(CircleLayer.attributeNames.center);
            if (easing) {
              easing.setTiming(1500 + i * 2);
            }
          }
        }
      } else {
        this.animationControl.center.delay = 1000;
        this.animationControl.color.delay = 1500;
        this.animationControl.radius.delay = 1000;

        this.moveToText(circles);
      }
    }, 8000);

    return circleProvider;
  }
}
