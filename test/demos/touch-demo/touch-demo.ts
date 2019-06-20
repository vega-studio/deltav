import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicSurface,
  ChartCamera,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  EasingUtil,
  InstanceProvider,
  IPickInfo,
  ITouchInteraction,
  nextFrame,
  PickType,
  SimpleEventHandler
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";

export class TouchDemo extends BaseDemo {
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    center: new InstanceProvider<CircleInstance>(),
    TR: new InstanceProvider<CircleInstance>(),
    TL: new InstanceProvider<CircleInstance>(),
    BL: new InstanceProvider<CircleInstance>(),
    BR: new InstanceProvider<CircleInstance>()
  };

  touchCircles = new Map<number | string, CircleInstance>();

  multitouchIndicator = new CircleInstance({
    center: [0, 0],
    radius: 50,
    color: [0.0, 0.0, 1.0, 0.2]
  });

  buildConsole(_gui: datGUI.GUI): void {
    // TODO
  }

  handleTestDotOver = (info: IPickInfo<CircleInstance>) => {
    info.instances.forEach(instance => {
      instance.radius = 1000;
    });
  };

  handleTestDotOut = (info: IPickInfo<CircleInstance>) => {
    info.instances.forEach(instance => {
      instance.radius = 100;
    });
  };

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new ChartCamera()
      },
      resources: {},
      eventManagers: _cameras => ({
        main: new SimpleEventHandler({
          handleTouchDown: (event: ITouchInteraction) => {
            event.touches.forEach(touch => {
              const circle = this.providers.circles.add(
                new CircleInstance({
                  center: touch.screen.position,
                  radius: 50,
                  color: [1.0, 0.0, 0.0, 0.2]
                })
              );

              this.touchCircles.set(touch.touch.touch.identifier, circle);
            });

            this.multitouchIndicator.center = event.multitouch.centerStart(
              event.allTouches
            );

            this.multitouchIndicator.radius = 50;
          },

          handleTouchCancelled: (event: ITouchInteraction) => {
            event.touches.forEach(touch => {
              const circle = this.touchCircles.get(
                touch.touch.touch.identifier
              );
              if (circle) this.providers.circles.remove(circle);
            });
          },

          handleTouchUp: (event: ITouchInteraction) => {
            event.touches.forEach(touch => {
              const circle = this.touchCircles.get(
                touch.touch.touch.identifier
              );
              if (circle) this.providers.circles.remove(circle);
            });
          },

          handleTouchDrag: (event: ITouchInteraction) => {
            event.touches.forEach(touch => {
              const circle = this.touchCircles.get(
                touch.touch.touch.identifier
              );

              if (circle) {
                circle.center = touch.screen.position;
              }
            });

            this.multitouchIndicator.center = event.multitouch.center(
              event.allTouches
            );

            this.multitouchIndicator.radius += event.multitouch.spreadDelta(
              event.allTouches
            );
          },

          handleTap: async (event: ITouchInteraction) => {
            const circle = new CircleInstance({
              center: event.touches[0].screen.position,
              radius: 0,
              color: [0.0, 1.0, 0.0, 0.5]
            });

            this.providers.circles.add(circle);

            await nextFrame();
            circle.radius = 100;
            circle.color = [0.0, 1.0, 0.0, 0.0];

            await EasingUtil.all(
              true,
              [circle],
              [CircleLayer.attributeNames.radius]
            );

            this.providers.circles.remove(circle);
          }
        })
      }),
      pipeline: (_resources, providers, cameras) => ({
        scenes: {
          TL: {
            views: {
              TL: createView({
                background: [0.1, 0, 0, 1],
                camera: new ChartCamera(),
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                viewport: {
                  left: 0,
                  width: "50%",
                  height: "50%",
                  top: 0
                }
              })
            },
            layers: {
              circles: createLayer(CircleLayer, {
                animate: {
                  radius: AutoEasingMethod.linear(500)
                },
                data: this.providers.TL,
                picking: PickType.SINGLE,
                scaleFactor: () => cameras.main.scale[0],
                onTouchOver: this.handleTestDotOver,
                onTouchOut: this.handleTestDotOut
              })
            }
          },
          TR: {
            views: {
              TR: createView({
                background: [0.1, 0.1, 0, 1],
                camera: new ChartCamera(),
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                viewport: {
                  left: "50%",
                  width: "50%",
                  height: "50%",
                  top: 0
                }
              })
            },
            layers: {
              circles: createLayer(CircleLayer, {
                animate: {
                  radius: AutoEasingMethod.linear(500)
                },
                data: this.providers.TR,
                picking: PickType.SINGLE,
                scaleFactor: () => cameras.main.scale[0],
                onTouchOver: this.handleTestDotOver,
                onTouchOut: this.handleTestDotOut
              })
            }
          },
          BL: {
            views: {
              BL: createView({
                background: [0.1, 0.1, 0.1, 1],
                camera: new ChartCamera(),
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                viewport: {
                  left: 0,
                  width: "50%",
                  height: "50%",
                  top: "50%"
                }
              })
            },
            layers: {
              circles: createLayer(CircleLayer, {
                animate: {
                  radius: AutoEasingMethod.linear(500)
                },
                data: this.providers.BL,
                picking: PickType.SINGLE,
                scaleFactor: () => cameras.main.scale[0],
                onTouchOver: this.handleTestDotOver,
                onTouchOut: this.handleTestDotOut
              })
            }
          },
          BR: {
            views: {
              BR: createView({
                background: [0, 0.1, 0.1, 1],
                camera: new ChartCamera(),
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                viewport: {
                  left: "50%",
                  width: "50%",
                  height: "50%",
                  top: "50%"
                }
              })
            },
            layers: {
              circles: createLayer(CircleLayer, {
                animate: {
                  radius: AutoEasingMethod.linear(500)
                },
                data: this.providers.BR,
                picking: PickType.SINGLE,
                scaleFactor: () => cameras.main.scale[0],
                onTouchOver: this.handleTestDotOver,
                onTouchOut: this.handleTestDotOut
              })
            }
          },
          default: {
            views: {
              "default-view": createView({
                background: [0, 0, 0, 1],
                camera: cameras.main,
                clearFlags: [ClearFlags.DEPTH]
              })
            },
            layers: {
              circles: createLayer(CircleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(500),
                  radius: AutoEasingMethod.linear(500)
                },
                data: providers.circles,
                scaleFactor: () => cameras.main.scale[0]
              }),
              center: createLayer(CircleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(500)
                },
                data: providers.center,
                scaleFactor: () => cameras.main.scale[0]
              })
            }
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;
    const size = this.surface.getViewScreenSize("TL.TL");

    this.providers.center.add(this.multitouchIndicator);

    this.providers.TL.add(
      new CircleInstance({
        radius: 10,
        center: [size[0] / 2, size[1] / 2]
      })
    );

    this.providers.TR.add(
      new CircleInstance({
        radius: 100,
        center: [size[0] / 2, size[1] / 2]
      })
    );

    this.providers.BL.add(
      new CircleInstance({
        radius: 100,
        center: [size[0] / 2, size[1] / 2]
      })
    );

    this.providers.BR.add(
      new CircleInstance({
        radius: 100,
        center: [size[0] / 2, size[1] / 2]
      })
    );
  }
}
