import * as datGUI from "dat.gui";
import {
  add2,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  EasingUtil,
  IMouseInteraction,
  InstanceProvider,
  ITouchInteraction,
  length2,
  nextFrame,
  onFrame,
  PostEffect,
  postProcess,
  scale2,
  Size,
  TextureSize,
  Vec2,
  Vec2Compat,
  View2D,
  ViewOutputInformationType
} from "../../../src";
import { SimpleEventHandler } from "../../../src/event-management/simple-event-handler";
import { createTexture } from "../../../src/resources/texture/render-texture";
import { BaseDemo } from "../../common/base-demo";

const { random } = Math;

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo extends BaseDemo {
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
  /** Stores the size of the screen */
  screen: Size;
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    circles: new InstanceProvider<CircleInstance>()
  };

  /** GUI properties */
  parameters = {
    count: 1000,
    radius: 100,
    moveAtOnce: 10000,
    addAtOnce: 10000,

    previous: {
      count: 1000
    }
  };

  currentLocation: Vec2Compat = [0, 0];

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Controller causes the number of circles rendered to change
    parameters
      .add(this.parameters, "count", 0, 500000, 1)
      .onFinishChange(async () => {
        while (this.circles.length < this.parameters.count) {
          for (
            let i = 0;
            i < this.parameters.addAtOnce &&
            this.circles.length < this.parameters.count;
            ++i
          ) {
            this.makeCircle();
          }
          await nextFrame();
        }

        while (this.circles.length > this.parameters.count) {
          for (
            let i = 0;
            i < this.parameters.addAtOnce &&
            this.circles.length > this.parameters.count;
            ++i
          ) {
            this.removeCircle();
          }
          await nextFrame();
        }
      });

    parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);
    parameters.add(this.parameters, "moveAtOnce", 0, 100000, 1);

    parameters
      .add(this.parameters, "radius", 0, 10000, 1)
      .onChange(async (_value: number) => {
        this.moveToLocation(this.currentLocation);
      });
  }

  destroy(): void {
    super.destroy();
    this.providers.circles.clear();
  }

  /**
   * I wanted to see what a JSX version of this config would look like to see if it was more
   * readable than JS objects or if it was too verbose:

    <Scene key='default'>
      <Views>
        <View key='default' camera={this.camera} background={[0, 0, 0, 1]} viewPort={{left: 0, right: '100%', top: 0, bottom: '100%'}} />
      </Views>
      <Layers>
        <Layer
          type={CircleLayer}
          key='circles'
          animate={{center: AutoEasingMethod.easeInOutQuad(1000, 100, AutoEasingLoopStyle.NONE)}}
          data={{this.providers.circle}}
          scaleFactor={() => this.camera.scale[0]}
        />
      </Layers>
    </Scene>

  */
  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {
        color: createTexture({
          width: TextureSize._2048,
          height: TextureSize._2048
        }),
        glow: createTexture({
          width: TextureSize._2048,
          height: TextureSize._2048
        }),
        blur: createTexture({
          width: TextureSize._2048,
          height: TextureSize._2048
        })
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"]
        }),
        clickScreen: new SimpleEventHandler({
          handleClick: (e: IMouseInteraction) => {
            const target = e.target;
            this.moveToLocation(
              target.view.projection.screenToWorld(e.screen.position)
            );
          },
          handleTap: (e: ITouchInteraction) => {
            const touch = e.touches[0];
            this.moveToLocation(
              touch.target.view.projection.screenToWorld(touch.screen.position)
            );
          }
        })
      }),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            main: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                buffers: [
                  {
                    outputType: ViewOutputInformationType.COLOR,
                    resource: resources.color.key
                  },
                  {
                    outputType: ViewOutputInformationType.GLOW,
                    resource: resources.glow.key
                  }
                ],
                depth: true
              }
            })
          },
          layers: {
            circles: createLayer(CircleLayer, {
              printShader: true,
              animate: {
                center: AutoEasingMethod.easeInOutCubic(
                  2000,
                  0,
                  AutoEasingLoopStyle.NONE
                )
              },
              data: providers.circles,
              scaleFactor: () => cameras.main.scale2D[0],
              usePoints: true
            })
          }
        },
        postEffects: {
          glowBlurHorizontal: PostEffect.gaussHorizontalBlur({
            input: resources.glow,
            output: resources.blur
          }),
          glowBlurVertical: PostEffect.gaussVerticalBlur({
            input: resources.blur,
            output: resources.glow
          }),
          combine: postProcess({
            buffers: {
              color: resources.color.key,
              glow: resources.glow.key
            },
            shader: require("./example.fs")
          })
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    this.screen = this.surface.getViewScreenSize("main.main");

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeCircle();
    }

    this.shakeCircles();
  }

  makeCircle() {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [random() * this.screen[0], random() * this.screen[1]],
        radius: random() * 10 + 2,
        color: [0, random(), random(), 1.0]
      })
    );

    this.circles.push(circle);
  }

  async moveToLocation(location: Vec2Compat) {
    this.currentLocation = location;

    let index = 0;
    while (index < this.circles.length) {
      const moved = [];
      for (
        let i = 0;
        i < this.parameters.moveAtOnce && index < this.circles.length;
        ++i, ++index
      ) {
        const circle = this.circles[index];
        let direction: Vec2 = [random() - 0.5, random() - 0.5];
        const mag = length2(direction);
        direction = scale2(direction, 1 / mag);
        circle.center = add2(
          location,
          scale2(direction, random() * this.parameters.radius)
        );
        moved.push(circle);
      }

      // Randomize their start times to make the stream more fluid
      EasingUtil.all(
        false,
        moved,
        [CircleLayer.attributeNames.center],
        easing => {
          easing.setTiming(Math.random() * 2000);
        }
      );

      await onFrame();
    }

    await EasingUtil.all(true, this.circles, [
      CircleLayer.attributeNames.center
    ]);

    this.currentLocation = location;
  }

  removeCircle() {
    const circle = this.circles.pop();
    if (circle) this.providers.circles.remove(circle);
  }

  shakeCircles() {
    clearTimeout(this.shakeTimer);

    this.shakeTimer = window.setTimeout(() => {
      this.circles.forEach(circle => {
        circle.center = [
          circle.center[0] + random() * 10 - 5,
          circle.center[1] + random() * 10 - 5
        ];
      });
    }, 100);
  }
}
