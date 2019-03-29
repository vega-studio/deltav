import {
  AutoEasingLoopStyle,
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  nextFrame,
  RectangleInstance,
  RectangleLayer,
  scale4,
  ScaleType,
  uid
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class VertexAttributePacking extends BaseExample {
  uid = uid();
  rectangleProvider = new InstanceProvider<RectangleInstance>();
  doesVertexpack: boolean;

  constructor(noVertexPacking?: boolean) {
    super();
    this.doesVertexpack = !noVertexPacking;
  }

  makeLayer(
    scene: string,
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ) {
    const animate = {
      start: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT),
      end: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT),
      control: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT)
    };

    if (!this.doesVertexpack) {
      delete animate.control;
    }

    return [
      createLayer(RectangleLayer, {
        data: this.rectangleProvider,
        key: `vertex-attribute-packing-circles-${this.uid}`,
        scene: scene
      }),
      createLayer(EdgeLayer, {
        animate,
        data: provider,
        key: `vertex-attribute-packing-${this.uid}`,
        scene: scene,
        type: EdgeType.LINE
      })
    ];
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const edges: EdgeInstance[] = [];
    const TOTAL_EDGES = 10;
    const { random } = Math;

    nextFrame(() => {
      const bounds = this.surface.getViewSize(this.view);
      if (!bounds) return;

      const boxWidth = Math.ceil(bounds.width / 10);
      const boxHeight = Math.ceil(bounds.height / 10);

      for (let i = 0; i < boxWidth; ++i) {
        for (let k = 0; k < boxHeight; ++k) {
          const circle = new RectangleInstance({
            width: 10,
            height: 10,
            x: i * 10,
            y: k * 10,
            color: scale4([random(), 1.0, random(), 1.0], 0.5),
            scaling: ScaleType.ALWAYS
          });

          this.rectangleProvider.add(circle);
        }
      }

      for (let i = 0; i < TOTAL_EDGES; ++i) {
        const edge = new EdgeInstance({
          colorEnd: [1.0, 0.0, 1.0, 1.0],
          colorStart: [0.0, 1.0, 1.0, 0.1],
          control: [[bounds.width / 2, bounds.height / 2]],
          end: [
            Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
              bounds.width / 2,
            bounds.height - 5
          ],
          start: [
            Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
              bounds.width / 2,
            5
          ],
          widthEnd: 5,
          widthStart: 5
        });

        edges.push(edge);
        edgeProvider.add(edge);
      }

      setInterval(() => {
        const totalWidth = bounds.width / 4 + bounds.width / 2;
        for (let i = 0; i < TOTAL_EDGES; ++i) {
          const edge = edges[i];
          edge.colorEnd = [
            (Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2) /
              totalWidth,
            0.0,
            1.0,
            1.0
          ];
          edge.colorStart = [
            0.0,
            1.0,
            (Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2) /
              totalWidth,
            0.01
          ];

          edge.start = [
            Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2,
            edge.start[1]
          ];
          edge.end = [
            Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2,
            edge.end[1]
          ];
        }
      }, 1000 / 20);
    });

    return edgeProvider;
  }
}
