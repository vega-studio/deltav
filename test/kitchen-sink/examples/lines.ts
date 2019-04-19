import {
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer
} from "src";
import { nextFrame } from "src/util/next-frame";
import { BaseExample, TestResourceKeys } from "./base-example";

export class Lines extends BaseExample {
  makeLayer(
    scene: string,
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      animate: {
        end: AutoEasingMethod.continuousSinusoidal(5000, 0)
      },
      data: provider,
      key: "lines",
      scene: scene,
      type: EdgeType.LINE
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const LINE_HEIGHT = 100;
    const countHigh = 40;
    const countWide = 240;
    const edges: EdgeInstance[] = [];

    for (let i = 0; i < countHigh; ++i) {
      const index = i;

      for (let k = 0; k < countWide; ++k) {
        const edge = new EdgeInstance({
          colorEnd: [Math.random(), Math.random(), 1.0, 1.0],
          colorStart: [Math.random(), Math.random(), 1.0, 1.0],
          end: [0, 0],
          id: `line-${index}-${k}`,
          start: [k * 20, index * LINE_HEIGHT + LINE_HEIGHT],
          widthEnd: 10,
          widthStart: 10
        });

        edges.push(edgeProvider.add(edge));
      }
    }

    // Wait a tick for the instances to be committed to the GPU so we can adjust their animation
    // to fit a nice wavey pattern
    nextFrame(() => {
      let count = 0;
      for (let i = 0; i < countHigh; ++i) {
        for (let k = 0; k < countWide; ++k) {
          const edge = edges[count];
          edge.end = [k * 20 + 10, i * LINE_HEIGHT + 4];

          const easing = edge.getEasing(EdgeLayer.attributeNames.end);
          if (easing) {
            easing.setStart([k * 20, i * LINE_HEIGHT + 4]);
            easing.setTiming(i * 100);
          }

          count++;
        }
      }
    });

    return edgeProvider;
  }
}
