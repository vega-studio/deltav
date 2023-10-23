import {
  AutoEasingMethod,
  Camera2D,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeScaleType,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
  ReferenceCamera2D
} from "../../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

/**
 * Test edges that are made with their curvature and line width declared in screen space
 */
export class ScreenSpaceEdges extends BaseExample {
  side = 0;
  camera?: ReferenceCamera2D;
  shiftIsDown: boolean = false;

  handleMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;
    info.instances.forEach(edge => (edge.thickness = [10, 10]));
  };

  handleMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[1] < 100 && this.side !== -1) {
      this.side = -1;
      info.instances.forEach(edge => (edge.thickness = [20, 10]));
    }

    if (info.world[1] >= 100 && this.side !== 1) {
      this.side = 1;
      info.instances.forEach(edge => (edge.thickness = [10, 20]));
    }
  };

  keyEvent(e: KeyboardEvent, _isDown: boolean) {
    this.shiftIsDown = e.shiftKey;
  }

  makeCamera(defaultCamera: Camera2D): Camera2D {
    this.camera = new ReferenceCamera2D({
      base: defaultCamera,
      offsetFilter: (offset: [number, number, number]) => [offset[0], 0, 0],
      scaleFilter: (scale: [number, number, number]) => [
        this.shiftIsDown ? 1 : scale[0],
        this.shiftIsDown ? scale[1] : 1,
        1
      ]
    });

    return this.camera;
  }

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      animate: {
        thickness: AutoEasingMethod.easeOutElastic(500)
      },
      data: provider,
      key: "screen-space-edges",
      onMouseMove: this.handleMouseMove,
      onMouseOut: this.handleMouseOut,
      picking: PickType.SINGLE,
      scaleFactor: () => this.camera?.scale2D[1] || 1,
      scaleType: EdgeScaleType.SCREEN_CURVE,
      type: EdgeType.BEZIER2
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    let edge = new EdgeInstance({
      startColor: [Math.random(), 1.0, Math.random(), 1.0],
      endColor: [Math.random(), 1.0, Math.random(), 0.25],
      control: [
        [45, 45],
        [45, -45]
      ],
      end: [20, 200],
      id: `edge-interaction-0`,
      start: [20, 20],
      thickness: [10, 10]
    });

    edgeProvider.add(edge);

    edge = new EdgeInstance({
      startColor: [Math.random(), 1.0, Math.random(), 1.0],
      endColor: [Math.random(), 1.0, Math.random(), 0.25],
      control: [
        [20, 45],
        [-20, 45]
      ],
      end: [200, 20],
      id: `edge-interaction-1`,
      start: [20, 20],
      thickness: [10, 10]
    });

    edgeProvider.add(edge);

    edge = new EdgeInstance({
      startColor: [Math.random(), 1.0, Math.random(), 1.0],
      endColor: [Math.random(), 1.0, Math.random(), 0.25],
      control: [
        [20, 20],
        [-20, -20]
      ],
      end: [200, 200],
      id: `edge-interaction-2`,
      start: [20, 20],
      thickness: [10, 10]
    });

    edgeProvider.add(edge);

    return edgeProvider;
  }
}
