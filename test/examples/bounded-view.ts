import {
  AnchorType,
  BasicCameraController,
  Bounds,
  CameraBoundsAnchor,
  ChartCamera,
  createLayer,
  EventManager,
  ICameraBoundsOptions,
  InstanceProvider,
  LayerInitializer,
  RectangleInstance,
  RectangleLayer,
  ScaleType,
} from '../../src';
import { BaseExample } from './base-example';

export class BoundedView extends BaseExample {
  view: string;
  manager: BasicCameraController;
  originalRange: Bounds;

  makeController(
    defaultCamera: ChartCamera,
    testCamera: ChartCamera,
    viewName: string,
  ): EventManager {
    const bounds: ICameraBoundsOptions = {
      anchor: CameraBoundsAnchor.TOP_LEFT,
      scaleMax: [5, 5, 5],
      scaleMin: [0.1, 0.1, 0.1],
      screenPadding: { left: 5, right: 5, top: 5, bottom: 5 },
      view: '3_1',
      worldBounds: new Bounds({
        left: 0,
        top: 0,
        right: 200,
        bottom: 200,
        x: 0,
        y: 0,
      }),
    };
    return new BasicCameraController({
      bounds: bounds,
      camera: defaultCamera,
      startView: viewName,
    });
  }

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<RectangleInstance>,
  ): LayerInitializer {
    return createLayer(RectangleLayer, {
      data: provider,
      key: 'bounded-view',
      scaleFactor: () => 1,
      scene: scene,
    });
  }

  makeProvider(): InstanceProvider<RectangleInstance> {
    const rectangleProvider = new InstanceProvider<RectangleInstance>();

    const x = [0, 100, 200, 100, 0, 100, 200, 100];
    const y = [100, 0, 100, 200, 100, 0, 100, 200];
    const height = [200, 5, 200, 5, 5, 200, 5, 200];
    const width = [5, 200, 5, 200, 200, 5, 200, 5];
    const color = [
      [100, 0, 0, 1.0],
      [0, 100, 0, 1.0],
      [0, 0, 100, 1.0],
      [55, 0, 55, 1.0],
      [0, 0, 100, 0.1],
      [55, 0, 55, 0.1],
      [0, 0, 100, 0.1],
      [55, 0, 55, 0.1],
    ];
    const anchor = [
      AnchorType.MiddleLeft,
      AnchorType.TopMiddle,
      AnchorType.MiddleRight,
      AnchorType.BottomMiddle,
      AnchorType.MiddleLeft,
      AnchorType.TopMiddle,
      AnchorType.MiddleRight,
      AnchorType.BottomMiddle,
    ];
    for (let i = 0; i < 8; i++) {
      const rectangle = new RectangleInstance({
        anchor: {
          padding: 0,
          type: anchor[i],
        },
        color: [color[i][0], color[i][1], color[i][2], color[i][3]],
        height: height[i],
        id: `rectangle${i}`,
        scaling: ScaleType.ALWAYS,
        width: width[i],
        x: x[i],
        y: y[i],
      });

      rectangleProvider.add(rectangle);
    }
    return rectangleProvider;
  }
}
