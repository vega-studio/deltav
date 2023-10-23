import {
  AutoEasingMethod,
  CircleInstance,
  CircleLayer,
  createLayer,
  EasingUtil,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType
} from "../../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseInteractionColorPicking extends BaseExample {
  edgeProvider = new InstanceProvider<EdgeInstance>();
  side = 0;

  handleCircleClick = (info: IPickInfo<CircleInstance>) => {
    info.instances.forEach(circle => (circle.color = [0, 1, 0, 1]));
  };

  handleCircleOver = (info: IPickInfo<CircleInstance>) => {
    info.instances.forEach(circle => (circle.radius = 20));

    EasingUtil.all(
      false,
      info.instances,
      [CircleLayer.attributeNames.radius],
      easing => {
        easing.setTiming(0, 100);
      }
    );
  };

  handleCircleOut = async (info: IPickInfo<CircleInstance>) => {
    info.instances.forEach(circle => (circle.radius = 5));

    EasingUtil.all(
      false,
      info.instances,
      [CircleLayer.attributeNames.radius],
      easing => {
        easing.setTiming(500, 1000);
      }
    );
  };

  handleEdgeMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;
    info.instances.forEach(edge => (edge.thickness = [10, 10]));
  };

  handleEdgeMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[0] < 100 && this.side !== -1) {
      this.side = -1;
      info.instances.forEach(edge => (edge.thickness = [20, 10]));
    }

    if (info.world[0] >= 100 && this.side !== 1) {
      this.side = 1;
      info.instances.forEach(edge => (edge.thickness = [10, 20]));
    }
  };

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<CircleInstance>
  ): LayerInitializer | LayerInitializer[] {
    return [
      createLayer(CircleLayer, {
        animate: {
          color: AutoEasingMethod.linear(1000),
          radius: AutoEasingMethod.easeOutElastic(1000)
        },
        data: provider,
        key: "mouse-interaction-color-picking-1",
        onMouseClick: this.handleCircleClick,
        onMouseOut: this.handleCircleOut,
        onMouseOver: this.handleCircleOver,
        opacity: () => 0.5,
        picking: PickType.SINGLE
      }),
      createLayer(EdgeLayer, {
        animate: {
          thickness: AutoEasingMethod.easeOutElastic(1000)
        },
        data: this.edgeProvider,
        key: "mouse-interaction-color-picking-2",
        onMouseMove: this.handleEdgeMouseMove,
        onMouseOut: this.handleEdgeMouseOut,
        picking: PickType.SINGLE,
        type: EdgeType.BEZIER2
      })
    ];
  }

  makeProvider(): InstanceProvider<CircleInstance> {
    const circleProvider = new InstanceProvider<CircleInstance>();
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 30; ++k) {
        const circle = new CircleInstance({
          color: [1.0, Math.random(), Math.random(), Math.random() * 0.8 + 0.2],
          id: `circle${i * 100 + k}`,
          radius: 5,
          center: [i * 10, k * 10]
        });

        circleProvider.add(circle);
      }
    }

    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        startColor: [Math.random(), 1.0, Math.random(), 1.0],
        endColor: [Math.random(), 1.0, Math.random(), 0.1],
        control: [
          [60, 20 * i + 20],
          [180, 20 * i + 20]
        ],
        end: [300, 20 * i + 20],
        id: `edge-interaction-${i}`,
        start: [20, 20 * i + 20],
        thickness: [10, 10]
      });

      edgeProvider.add(edge);
    }

    this.edgeProvider = edgeProvider;
    return circleProvider;
  }
}
