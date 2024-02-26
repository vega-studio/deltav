import React from "react";
import {
  add2,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  onAnimationLoop,
  onFrame,
  PromiseResolver,
  RectangleInstance,
  RectangleLayer,
  SceneJSX,
  stopAnimationLoop,
  Surface,
  SurfaceJSX,
  Vec4,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/2D/Square",
  args: {},
  argTypes: {},
};

export const Simple: StoryFn = (() => {
  const rectProvider = React.useRef<InstanceProvider<RectangleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 5000;
  const rectangles = 20;
  const gap = 0;
  const interval = 100;
  const baseSpeed = 3;

  /**
   * Generate a color of the rainbow based on a value between min and max
   *
   * @param value
   * @param min
   * @param max
   * @returns
   */
  function rainbowColor(value: number, min = 0, max = 100): Vec4 {
    const normalizedValue = (value - min) / (max - min);
    const segment = normalizedValue * 6;
    const segmentIndex = Math.floor(segment);
    const gradient = segment - segmentIndex;
    let r = 0,
      g = 0,
      b = 0;

    switch (segmentIndex) {
      case 0:
        r = 1;
        g = gradient;
        break;
      case 1:
        r = 1 - gradient;
        g = 1;
        break;
      case 2:
        g = 1;
        b = gradient;
        break;
      case 3:
        g = 1 - gradient;
        b = 1;
        break;
      case 4:
        r = gradient;
        b = 1;
        break;
      case 5:
        r = 1;
        b = 1 - gradient;
        break;
      default:
        break;
    }

    return [r, g, b, 1];
  }

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!rectProvider.current) return;
      const surface = await ready.current.promise;
      const viewSize = surface.getViewSize("turtles.main");

      const provider = rectProvider.current;
      const instances: RectangleInstance[] = [];

      const color: Vec4 = [0, 0.2, 0.5, 1];

      if (!viewSize) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const squareWidth = (viewSize.width - gap) / rectangles;
      const squareHeight = viewSize.height / rectangles;
      const speeds: number[] = [];

      // Create a row of squares
      const createSquares = () => {
        for (let r = 0; r <= rectangles; ++r) {
          for (let c = 0; c < rectangles; ++c) {
            const y = r * squareHeight;
            const x = c * squareWidth + gap;
            const width = squareWidth - gap;
            const height = squareHeight - gap;
            const rectangle = provider.add(
              new RectangleInstance({
                position: [x, y],
                size: [width, height],
                color,
              })
            );
            instances.push(rectangle);
            speeds[(r + 1) * c] = Math.random() * baseSpeed + 0.1;
          }
        }
      };

      createSquares();

      const loopId = onAnimationLoop((_t: number) => {
        const currentTime = _t % animationDuration;
        const timePercent = currentTime / animationDuration;
        // Move the particles to locations and fade them out
        onFrame(() => {
          instances.forEach((r, i) => {
            const c = i % rectangles;
            // Generate the color based on y position
            r.color = rainbowColor(
              r.position[1],
              -squareHeight,
              viewSize.height
            );
            // Generate the color based on progress of the animation duration
            // r.color = rainbowColor(timePercent, 0, 1);
            // const y = AutoEasingMethod.easeOutCubic(animationDuration).cpu(
            //   -squareHeight,
            //   [viewSize.height],
            //   timePercent
            // );
            if (r.position[1] < viewSize.height) {
              // Use random speed
              r.position = add2(r.position, [0, speeds[c]]);
              // Use fixed speed
              // r.position = add2(r.position, [0, 1]);
              // r.position = add2(r.position, [0, y]);
            } else {
              r.position = [r.position[0], -squareHeight];
            }
          });
        }, interval);
      }, 10);

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <SceneJSX name="turtles">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: new Camera2D(),
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <LayerJSX
          type={RectangleLayer}
          providerRef={rectProvider}
          config={{
            animate: {},
          }}
        />
      </SceneJSX>
    </SurfaceJSX>
  );
}).bind({});
