import * as datGUI from "dat.gui";
import {
  add2,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCameraController,
  BasicSurface,
  ChartCamera,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  EasingUtil,
  IMouseInteraction,
  InstanceProvider,
  length2,
  nextFrame,
  scale2,
  Vec2
} from "src";
import { BaseDemo } from "../../common/base-demo";
import { EventHandler } from "../../common/event-handler";

const { random } = Math;

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo extends BaseDemo {
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
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

  currentLocation: Vec2 = [0, 0];

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
        main: new ChartCamera()
      },
      resources: {},
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["default-view"]
        }),
        clickScreen: new EventHandler({
          handleClick: (e: IMouseInteraction, _button: number) => {
            const target = e.target;
            this.moveToLocation(target.view.screenToWorld(e.screen.mouse));
          }
        })
      }),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: [
          {
            key: "default",
            views: [
              createView({
                key: "default-view",
                camera: cameras.main,
                background: [0, 0, 0, 1],
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            ],
            layers: [
              createLayer(CircleLayer, {
                animate: {
                  center: AutoEasingMethod.easeInOutCubic(
                    2000,
                    0,
                    AutoEasingLoopStyle.NONE
                  )
                },
                data: providers.circles,
                key: `circles`,
                scaleFactor: () => cameras.main.scale[0]
              })
            ]
          }
        ]
      })
    });
  }

  async init() {
    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeCircle();
    }

    this.shakeCircles();
  }

  makeCircle() {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [random() * 2000, random() * 2000],
        radius: random() * 10 + 2,
        color: [0, random(), random(), 1.0]
      })
    );

    this.circles.push(circle);
  }

  async moveToLocation(location: Vec2) {
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

      await nextFrame();
    }

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
