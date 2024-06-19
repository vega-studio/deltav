import React from "react";
import {
  add2,
  AnchorType,
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  ClearFlags,
  color4FromHex3,
  EasingUtil,
  InstanceProvider,
  LayerJSX,
  length2,
  multiply2,
  nextFrame,
  onFrame,
  PromiseResolver,
  RectangleInstance,
  RectangleLayer,
  scale2,
  subtract2,
  Surface,
  SurfaceJSX,
  type Vec2,
  View2D,
  ViewJSX,
} from "../../../src";
import { Employee, type IGrid } from "./employee";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/InteractiveDemo",
  args: {},
  argTypes: {},
};

const ANIMATION_DURATION = 300;

export const Basic: StoryFn = (() => {
  const squareProvider =
    React.useRef<InstanceProvider<RectangleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const camera = React.useRef<Camera2D>(new Camera2D());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      const provider = squareProvider.current;
      if (!squareProvider.current || !provider) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const colorsHex = {
        DESIGNERS: 0x59c4f6,
        FRONTEND: 0xf7cd47,
        BACKEND: 0xeb539f,
        DEVOPS: 0x782cf6,
      };

      const colors = {
        DESIGNERS: color4FromHex3(colorsHex.DESIGNERS),
        FRONTEND: color4FromHex3(colorsHex.FRONTEND),
        BACKEND: color4FromHex3(colorsHex.BACKEND),
        DEVOPS: color4FromHex3(colorsHex.DEVOPS),
      };

      const grid: RectangleInstance[][] = [];
      const gridComplete: boolean[][] = [];
      const gridFinished: boolean[][] = [];
      const employeeCount = 6;
      const gridW = 9;
      const gridH = 9;
      const taskDuration = Math.floor(gridW / 3);
      const gap = 5;
      const cellH = size.height / gridH - gap;
      const cellW = cellH;
      const TL = subtract2(
        add2(size.mid, [gap / 2, gap / 2]),
        multiply2([gridW / 2, gridH / 2], [cellW + gap, cellH + gap])
      );

      const colColors = [colors.DESIGNERS, colors.FRONTEND, colors.BACKEND];

      const loopGrid = async (
        cb: (
          x: number,
          y: number,
          dir: Vec2,
          mag: number
        ) => Promise<void> | void,
        row?: () => void
      ) => {
        for (let i = 0, iMax = gridW; i < iMax; ++i) {
          row?.();
          for (let k = 0, kMax = gridH; k < kMax; ++k) {
            const dir: Vec2 = [i, k];
            const mag = length2(dir);
            await cb(i, k, scale2(dir, 1 / mag), mag);
          }
        }
      };

      // Init the grid
      await loopGrid(
        (x, y) => {
          gridComplete[x].push(false);
          grid[x].push(
            provider.add(
              new RectangleInstance({
                anchor: {
                  type: AnchorType.TopLeft,
                  padding: 0,
                },
                position: add2(
                  TL,
                  multiply2([x, y], [cellW + gap, cellH + gap])
                ),
                size: [cellW, cellH],
                outline: 0,
                outlineColor: colColors[Math.floor(x / taskDuration)],
              })
            )
          );
        },
        () => {
          grid.push([]);
          gridFinished.push([]);
          gridComplete.push([]);
        }
      );

      // Let the stuff intialize
      await nextFrame();
      let doneTime = 0;

      // Show grid
      await loopGrid((x, y, _dir, mag) => {
        const box = grid[x][y];
        EasingUtil.modify(
          [box],
          [RectangleLayer.attributeNames.outline],
          (ease) => {
            ease.setTiming((doneTime = mag * 100));
          }
        );
        box.outline = 2;
      });

      // Wait for grid to finish
      await onFrame(void 0, doneTime);

      const board: IGrid = {
        cellH,
        cellW,
        gridH,
        gridW,
        gap,
        complete: gridComplete,
        finished: gridFinished,
        provider,
        TL,
        completionBoxes: new Map<number, Map<number, RectangleInstance>>(),
        grid,
      };

      const disposers: Function[] = [];

      // Make our employees to start attacking the grid
      for (let i = 0, iMax = employeeCount; i < iMax; ++i) {
        const teamCount = Math.floor(iMax / 3);
        const col = Math.floor(i / teamCount);
        const employee = new Employee(
          colColors[col],
          col * taskDuration,
          taskDuration
        );
        provider.add(employee.instance);
        disposers.push(await employee.work(board));
      }

      return () => {
        disposers.forEach((d) => d());
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
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        type={RectangleLayer}
        providerRef={squareProvider}
        config={{
          printShader: true,
          animate: {
            outline: AutoEasingMethod.easeOutCubic(ANIMATION_DURATION),
            outlineColor: AutoEasingMethod.easeOutCubic(ANIMATION_DURATION),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
