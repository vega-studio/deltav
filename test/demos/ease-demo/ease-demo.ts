import * as datGUI from 'dat.gui';
import {
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  View2D,
} from 'src';
import { BaseDemo } from '../../common/base-demo';
import { DEFAULT_RESOURCES } from '../../types';

export class EaseDemo extends BaseDemo {
  rectangles: RectangleInstance[] = [];
  followingRectangles: RectangleInstance[] = [];
  labels: LabelInstance[] = [];

  duration: number = 2000;
  delay: number = 0;
  loopStyle: AutoEasingLoopStyle = AutoEasingLoopStyle.REFLECT;

  providers = {
    // immediate
    rectangles1: new InstanceProvider<RectangleInstance>(),
    // linear
    rectangles2: new InstanceProvider<RectangleInstance>(),
    // easeInQuad
    rectangles3: new InstanceProvider<RectangleInstance>(),
    // easeOutQuad
    rectangles4: new InstanceProvider<RectangleInstance>(),
    // easeInOutQuad
    rectangles5: new InstanceProvider<RectangleInstance>(),
    // easeInCubic
    rectangles6: new InstanceProvider<RectangleInstance>(),
    // easeOutCubic
    rectangles7: new InstanceProvider<RectangleInstance>(),
    // easeInOutCubic
    rectangles8: new InstanceProvider<RectangleInstance>(),
    // easeInQuart
    rectangles9: new InstanceProvider<RectangleInstance>(),
    // easeOutQuart
    rectangles10: new InstanceProvider<RectangleInstance>(),
    // easeInOutQuart
    rectangles11: new InstanceProvider<RectangleInstance>(),
    // easeInQuint
    rectangles12: new InstanceProvider<RectangleInstance>(),
    // easeOutQuint
    rectangles13: new InstanceProvider<RectangleInstance>(),
    // easeOutElastic
    rectangles14: new InstanceProvider<RectangleInstance>(),
    // easeBackIn
    rectangles15: new InstanceProvider<RectangleInstance>(),
    // easeBackOut
    rectangles16: new InstanceProvider<RectangleInstance>(),
    // easeBackInOut
    rectangles17: new InstanceProvider<RectangleInstance>(),
    // continuousSinusoidal
    rectangles18: new InstanceProvider<RectangleInstance>(),
    // labels
    labels: new InstanceProvider<LabelInstance>(),
    // lines
    lines: new InstanceProvider<EdgeInstance>(),
  };

  parameters = {
    duration: 2000,
    delay: 0,
    loopStyle: '1',
    start: () => {
      this.clear();
      this.init();
    },
  };

  reset() {
    if (this.surface) {
      this.destroy();
      this.surface.rebuild();
      this.init();
    }
  }

  buildConsole(gui: datGUI.GUI): void {
    gui
      .add(this.parameters, 'duration', 0, 10000, 100)
      .onFinishChange((value: number) => {
        this.duration = value;
        this.reset();
      });

    gui
      .add(this.parameters, 'delay', 0, 10000, 100)
      .onFinishChange((value: number) => {
        this.duration = value;
        this.reset();
      });

    gui
      .add(this.parameters, 'loopStyle', {
        NONE: 0,
        REFLECT: 1,
        REPEAT: 2,
        CONTINUOUS: 3,
      })
      .onFinishChange((value: string) => {
        switch (value) {
          case '0':
            this.loopStyle = AutoEasingLoopStyle.NONE;
            break;
          case '1':
            this.loopStyle = AutoEasingLoopStyle.REFLECT;
            break;
          case '2':
            this.loopStyle = AutoEasingLoopStyle.REPEAT;
            break;
          case '3':
            this.loopStyle = AutoEasingLoopStyle.CONTINUOUS;
        }

        this.reset();
      });

    gui.add(this.parameters, 'start');
  }

  makeSurface(container: HTMLElement) {
    console.warn('make surface');
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D(),
      },
      resources: {
        font: DEFAULT_RESOURCES.font,
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ['main.main'],
        }),
      }),
      pipeline: (resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              main: createView(View2D, {
                camera: cameras.main,
                background: [0, 0, 0, 1],
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              }),
            },
            layers: [
              // immediate
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.immediate(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles1,
                key: `rectangles1`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // linear
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.linear(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles2,
                key: `rectangles2`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInQuad
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInQuad(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles3,
                key: `rectangles3`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeOutQuad
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeOutQuad(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles4,
                key: `rectangles4`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInOutQuad
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInOutQuad(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles5,
                key: `rectangles5`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInCubic
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInCubic(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles6,
                key: `rectangles6`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeOutCubic
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeOutCubic(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles7,
                key: `rectangles7`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInOutCubic
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInOutCubic(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles8,
                key: `rectangles8`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInQuart
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInQuart(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles9,
                key: `rectangles9`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeOutQuart
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeOutQuart(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles10,
                key: `rectangles10`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInOutQuart
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInOutQuart(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles11,
                key: `rectangles11`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeInQuint
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeInQuint(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles12,
                key: `rectangles12`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeOutQuint
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeOutQuint(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles13,
                key: `rectangles13`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeOutElastic
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeOutElastic(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles14,
                key: `rectangles14`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeBackIn
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeBackIn(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles15,
                key: `rectangles15`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeBackOut
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeBackOut(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles16,
                key: `rectangles16`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // easeBackInOut
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.easeBackInOut(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles17,
                key: `rectangles17`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              // continuousSinusoidal
              createLayer(RectangleLayer, {
                animate: {
                  location: AutoEasingMethod.continuousSinusoidal(
                    this.duration,
                    this.delay,
                    this.loopStyle
                  ),
                },
                data: providers.rectangles18,
                key: `rectangles`,
                scaleFactor: () => cameras.main.scale2D[0],
              }),
              createLayer(LabelLayer, {
                data: providers.labels,
                key: `labels`,
                resourceKey: resources.font.key,
                scaleMode: ScaleMode.ALWAYS,
              }),
              createLayer(EdgeLayer, {
                data: this.providers.lines,
                key: 'lines',
                type: EdgeType.LINE,
              }),
            ],
          },
        },
      }),
    });
  }

  destroy() {
    super.destroy();
    this.clear();
  }

  clear() {
    this.providers.rectangles1.clear();
    this.providers.rectangles2.clear();
    this.providers.rectangles3.clear();
    this.providers.rectangles4.clear();
    this.providers.rectangles5.clear();
    this.providers.rectangles6.clear();
    this.providers.rectangles7.clear();
    this.providers.rectangles8.clear();
    this.providers.rectangles9.clear();
    this.providers.rectangles10.clear();
    this.providers.rectangles11.clear();
    this.providers.rectangles12.clear();
    this.providers.rectangles13.clear();
    this.providers.rectangles14.clear();
    this.providers.rectangles15.clear();
    this.providers.rectangles16.clear();
    this.providers.rectangles17.clear();
    this.providers.rectangles18.clear();
    this.providers.labels.clear();
    this.providers.lines.clear();
    this.rectangles = [];
    this.followingRectangles = [];
  }

  addRectanglesToProvider() {
    this.providers.rectangles1.add(this.rectangles[0]);
    this.providers.rectangles2.add(this.rectangles[1]);
    this.providers.rectangles3.add(this.rectangles[2]);
    this.providers.rectangles4.add(this.rectangles[3]);
    this.providers.rectangles5.add(this.rectangles[4]);
    this.providers.rectangles6.add(this.rectangles[5]);
    this.providers.rectangles7.add(this.rectangles[6]);
    this.providers.rectangles8.add(this.rectangles[7]);
    this.providers.rectangles9.add(this.rectangles[8]);
    this.providers.rectangles10.add(this.rectangles[9]);
    this.providers.rectangles11.add(this.rectangles[10]);
    this.providers.rectangles12.add(this.rectangles[11]);
    this.providers.rectangles13.add(this.rectangles[12]);
    this.providers.rectangles14.add(this.rectangles[13]);
    this.providers.rectangles15.add(this.rectangles[14]);
    this.providers.rectangles16.add(this.rectangles[15]);
    this.providers.rectangles17.add(this.rectangles[16]);
    this.providers.rectangles18.add(this.rectangles[17]);

    this.providers.rectangles1.add(this.followingRectangles[0]);
    this.providers.rectangles2.add(this.followingRectangles[1]);
    this.providers.rectangles3.add(this.followingRectangles[2]);
    this.providers.rectangles4.add(this.followingRectangles[3]);
    this.providers.rectangles5.add(this.followingRectangles[4]);
    this.providers.rectangles6.add(this.followingRectangles[5]);
    this.providers.rectangles7.add(this.followingRectangles[6]);
    this.providers.rectangles8.add(this.followingRectangles[7]);
    this.providers.rectangles9.add(this.followingRectangles[8]);
    this.providers.rectangles10.add(this.followingRectangles[9]);
    this.providers.rectangles11.add(this.followingRectangles[10]);
    this.providers.rectangles12.add(this.followingRectangles[11]);
    this.providers.rectangles13.add(this.followingRectangles[12]);
    this.providers.rectangles14.add(this.followingRectangles[13]);
    this.providers.rectangles15.add(this.followingRectangles[14]);
    this.providers.rectangles16.add(this.followingRectangles[15]);
    this.providers.rectangles17.add(this.followingRectangles[16]);
    this.providers.rectangles18.add(this.followingRectangles[17]);
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    const labelTexts = [
      'immediate',
      'linear',
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic',
      'easeInQuart',
      'easeOutQuart',
      'easeInOutQuart',
      'easeInQuint',
      'easeOutQuint',
      'easeOutElastic',
      'easeBackIn',
      'easeBackOut',
      'easeBackInOut',
      'continuousSinusoidal',
    ];

    for (let i = 0; i < 18; i++) {
      this.rectangles.push(
        new RectangleInstance({
          position: [
            window.innerWidth * 0.05,
            window.innerHeight * i / 18 +
              window.innerHeight / 36 +
              window.innerHeight / 100,
          ],
          size: [10, 10],
          color: [1, 1, 1, 1],
        })
      );

      this.followingRectangles.push(
        new RectangleInstance({
          position: [
            window.innerWidth * 0.05,
            window.innerHeight * i / 18 +
              window.innerHeight / 36 +
              window.innerHeight / 100,
          ],
          size: [10, 10],
          color: [1, 1, 1, 0.3],
        })
      );

      this.providers.labels.add(
        new LabelInstance({
          origin: [
            window.innerWidth * 0.05,
            window.innerHeight * i / 18 + window.innerHeight / 100,
          ],
          fontSize: 20,
          text: labelTexts[i],
          color: [1, 1, 1, 1],
        })
      );

      this.providers.lines.add(
        new EdgeInstance({
          start: [
            window.innerWidth * 0.05,
            window.innerHeight * i / 18 + window.innerHeight / 100,
          ],
          end: [
            window.innerWidth * 0.86,
            window.innerHeight * i / 18 + window.innerHeight / 100,
          ],
          startColor: [1, 1, 1, 1],
          endColor: [1, 1, 1, 1],
        })
      );
    }

    this.addRectanglesToProvider();

    setTimeout(() => {
      this.rectangles.forEach(
        rec => (rec.position = [window.innerWidth * 0.85, rec.position[1]])
      );
    }, 100);

    setTimeout(() => {
      this.followingRectangles.forEach(
        rec => (rec.position = [window.innerWidth * 0.85, rec.position[1]])
      );
    }, 1500);
  }
}
