import { hsl } from "d3-color";
import {
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LabelLayer,
  LayerInitializer,
  Vec4
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class Blending extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer[] {
    return [
      createLayer(EdgeLayer, {
        animate: {
          colorEnd: AutoEasingMethod.easeInOutCubic(500),
          colorStart: AutoEasingMethod.easeInOutCubic(500)
        },
        data: provider,
        key: "blending",
        scene: scene,
        type: EdgeType.LINE,

        materialOptions: {
          depthTest: true
        }
      }),
      createLayer(LabelLayer, {
        data: new InstanceProvider(),
        key: "blending-labels",
        scene: scene,
        resourceKey: resource.font
      })
    ];
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const sections = 1000;
    const edges = [];

    for (let i = 0; i < sections; ++i) {
      const rgb = hsl(i / sections * 360, 1, 0.5, 0.2).rgb();
      const color: Vec4 = [rgb.r / 255, rgb.g / 255, rgb.b / 255, rgb.opacity];

      const sx = Math.cos(i / sections * Math.PI) * 100 + 200;
      const sy = Math.sin(i / sections * Math.PI) * 100 + 200;
      const ex = Math.cos(i / sections * Math.PI + Math.PI) * 100 + 200;
      const ey = Math.sin(i / sections * Math.PI + Math.PI) * 100 + 200;

      edges.push(
        new EdgeInstance({
          colorEnd: color,
          colorStart: color,
          depth: -i,
          widthStart: 5,
          widthEnd: 5,
          start: [sx, sy],
          end: [ex, ey]
        })
      );
    }

    edgeProvider.add(
      new EdgeInstance({
        colorEnd: [1, 0, 0, 0.333333],
        colorStart: [1, 0, 0, 0.3],
        depth: 0,
        widthStart: 10,
        widthEnd: 10,
        start: [10, 0],
        end: [10, 100]
      })
    );

    edgeProvider.add(
      new EdgeInstance({
        colorEnd: [0, 1, 0, 0.333333],
        colorStart: [0, 1, 0, 0.333333],
        depth: 1,
        widthStart: 10,
        widthEnd: 10,
        start: [10, 20],
        end: [10, 120]
      })
    );

    edgeProvider.add(
      new EdgeInstance({
        colorEnd: [0, 0, 1, 0.333333],
        colorStart: [0, 0, 1, 0.333333],
        depth: 1,
        widthStart: 10,
        widthEnd: 10,
        start: [10, 40],
        end: [10, 140]
      })
    );

    while (edges.length > 0) {
      const index = Math.floor(Math.random() * edges.length);
      edgeProvider.add(edges[index]);
      edges.splice(index, 1);
    }

    return edgeProvider;
  }
}
