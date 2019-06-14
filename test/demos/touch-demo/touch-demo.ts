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
  ITouchInteraction,
  nextFrame,
  SimpleEventHandler
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";

export class TouchDemo extends BaseDemo {
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    center: new InstanceProvider<CircleInstance>()
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
                  center: touch.target.position,
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
                circle.center = touch.target.position;
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
              center: event.touches[0].target.position,
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
          default: {
            views: {
              "default-view": createView({
                background: [0, 0, 0, 1],
                camera: cameras.main,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
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
    this.providers.center.add(this.multitouchIndicator);
  }
}
