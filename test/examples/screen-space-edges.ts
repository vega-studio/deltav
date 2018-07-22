import * as anime from "animejs";
import {
  ChartCamera,
  createLayer,
  EdgeBroadphase,
  EdgeInstance,
  EdgeLayer,
  EdgeScaleType,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
  ReferenceCamera
} from "src";
import { BaseExample } from "./base-example";

/**
 * Test edges that are made with their curvature and line width declared in screen space
 */
export class ScreenSpaceEdges extends BaseExample {
  side = 0;
  camera: ReferenceCamera;
  shiftIsDown: boolean = false;

  handleMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;

    anime.remove(info.instances);
    anime({
      targets: info.instances,
      widthEnd: 10,
      widthStart: 10
    });
  };

  handleMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[1] < 100 && this.side !== -1) {
      this.side = -1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 10,
        widthStart: 20
      });
    }

    if (info.world[1] >= 100 && this.side !== 1) {
      this.side = 1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 20,
        widthStart: 10
      });
    }
  };

  keyEvent(e: KeyboardEvent, _isDown: boolean) {
    this.shiftIsDown = e.shiftKey;
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    this.camera = new ReferenceCamera({
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
    scene: string,
    _atlas: string,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      broadphase: EdgeBroadphase.PASS_X,
      data: provider,
      key: "screen-space-edges",
      onMouseMove: this.handleMouseMove,
      onMouseOut: this.handleMouseOut,
      picking: PickType.ALL,
      scaleFactor: () => this.camera.scale[1],
      scaleType: EdgeScaleType.SCREEN_CURVE,
      scene: scene,
      type: EdgeType.BEZIER2
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    let edge = new EdgeInstance({
      colorEnd: [Math.random(), 1.0, Math.random(), 0.25],
      colorStart: [Math.random(), 1.0, Math.random(), 1.0],
      control: [[45, 45], [45, -45]],
      end: [20, 200],
      id: `edge-interaction-0`,
      start: [20, 20],
      widthEnd: 10,
      widthStart: 10
    });

    edgeProvider.add(edge);

    edge = new EdgeInstance({
      colorEnd: [Math.random(), 1.0, Math.random(), 0.25],
      colorStart: [Math.random(), 1.0, Math.random(), 1.0],
      control: [[20, 45], [-20, 45]],
      end: [200, 20],
      id: `edge-interaction-1`,
      start: [20, 20],
      widthEnd: 10,
      widthStart: 10
    });

    edgeProvider.add(edge);

    edge = new EdgeInstance({
      colorEnd: [Math.random(), 1.0, Math.random(), 0.25],
      colorStart: [Math.random(), 1.0, Math.random(), 1.0],
      control: [[20, 20], [-20, -20]],
      end: [200, 200],
      id: `edge-interaction-2`,
      start: [20, 20],
      widthEnd: 10,
      widthStart: 10
    });

    edgeProvider.add(edge);

    return edgeProvider;
  }
}
