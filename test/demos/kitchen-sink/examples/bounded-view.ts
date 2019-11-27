import {
  AnchorType,
  BasicCamera2DController,
  Bounds,
  Camera2D,
  CameraBoundsAnchor,
  createLayer,
  EventManager,
  ICameraBoundsOptions,
  InstanceProvider,
  LayerInitializer,
  RectangleInstance,
  RectangleLayer,
  ScaleMode
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class BoundedView extends BaseExample {
  view: string;
  manager: BasicCamera2DController;
  originalRange: Bounds<never>;

  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ): EventManager {
    const bounds: ICameraBoundsOptions = {
      anchor: CameraBoundsAnchor.TOP_LEFT,
      scaleMax: [5, 5, 5],
      scaleMin: [0.1, 0.1, 0.1],
      screenPadding: { left: 5, right: 5, top: 5, bottom: 5 },
      view: "3_1",
      worldBounds: new Bounds({
        bottom: 200,
        left: 0,
        right: 200,
        top: 0,
        x: 0,
        y: 0
      })
    };
    return new BasicCamera2DController({
      bounds: bounds,
      camera: defaultCamera,
      startView: viewName
    });
  }

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<RectangleInstance>
  ): LayerInitializer {
    return createLayer(RectangleLayer, {
      data: provider,
      key: "bounded-view"
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
      [55, 0, 55, 0.1]
    ];
    const anchor = [
      AnchorType.MiddleLeft,
      AnchorType.TopMiddle,
      AnchorType.MiddleRight,
      AnchorType.BottomMiddle,
      AnchorType.MiddleLeft,
      AnchorType.TopMiddle,
      AnchorType.MiddleRight,
      AnchorType.BottomMiddle
    ];
    for (let i = 0; i < 8; i++) {
      const rectangle = new RectangleInstance({
        anchor: {
          padding: 0,
          type: anchor[i]
        },
        color: [color[i][0], color[i][1], color[i][2], color[i][3]],
        id: `rectangle${i}`,
        scaling: ScaleMode.ALWAYS,
        size: [width[i], height[i]],
        position: [x[i], y[i]]
      });

      rectangleProvider.add(rectangle);
    }
    return rectangleProvider;
  }
}
