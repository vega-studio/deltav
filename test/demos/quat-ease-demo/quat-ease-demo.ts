import * as datGUI from "dat.gui";
import {
  AnchorType,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  Axis2D,
  BasicSurface,
  Camera,
  Camera2D,
  ClearFlags,
  createLayer,
  createLayer2Din3D,
  createView,
  eulerToQuat,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  onFrame,
  ScaleMode,
  Transform,
  View3D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { DEFAULT_RESOURCES } from "../../types";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

export class QuatEaseDemo extends BaseDemo {
  duration: number = 2000;
  delay: number = 0;
  loopStyle: AutoEasingLoopStyle = AutoEasingLoopStyle.REFLECT;

  providers = {
    cubes0: new InstanceProvider<CubeInstance>(),
    cubes1: new InstanceProvider<CubeInstance>(),
    cubes2: new InstanceProvider<CubeInstance>(),
    cubes3: new InstanceProvider<CubeInstance>(),
    cubes4: new InstanceProvider<CubeInstance>(),
    cubes5: new InstanceProvider<CubeInstance>(),
    cubes6: new InstanceProvider<CubeInstance>(),
    cubes7: new InstanceProvider<CubeInstance>(),
    cubes8: new InstanceProvider<CubeInstance>(),
    cubes9: new InstanceProvider<CubeInstance>(),
    cubes10: new InstanceProvider<CubeInstance>(),
    cubes11: new InstanceProvider<CubeInstance>(),
    cubes12: new InstanceProvider<CubeInstance>(),
    cubes13: new InstanceProvider<CubeInstance>(),
    cubes14: new InstanceProvider<CubeInstance>(),
    cubes15: new InstanceProvider<CubeInstance>(),
    cubes16: new InstanceProvider<CubeInstance>(),
    cubes17: new InstanceProvider<CubeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  parameters = {
    duration: 2000,
    delay: 0,
    loopStyle: "1",
    start: () => {
      this.clear();
      this.init();
    }
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
      .add(this.parameters, "duration", 0, 10000, 100)
      .onFinishChange((value: number) => {
        this.duration = value;
        this.reset();
      });

    gui
      .add(this.parameters, "delay", 0, 10000, 100)
      .onFinishChange((value: number) => {
        this.duration = value;
        this.reset();
      });

    gui
      .add(this.parameters, "loopStyle", {
        NONE: 0,
        REFLECT: 1,
        REPEAT: 2,
        CONTINUOUS: 3
      })
      .onFinishChange((value: string) => {
        switch (value) {
          case "0":
            this.loopStyle = AutoEasingLoopStyle.NONE;
            break;
          case "1":
            this.loopStyle = AutoEasingLoopStyle.REFLECT;
            break;
          case "2":
            this.loopStyle = AutoEasingLoopStyle.REPEAT;
            break;
          case "3":
            this.loopStyle = AutoEasingLoopStyle.CONTINUOUS;
        }

        this.reset();
      });

    gui.add(this.parameters, "start");
  }

  destroy() {
    super.destroy();
    this.clear();
  }

  clear() {
    this.providers.cubes0.clear();
    this.providers.cubes1.clear();
    this.providers.cubes2.clear();
    this.providers.cubes3.clear();
    this.providers.cubes4.clear();
    this.providers.cubes5.clear();
    this.providers.cubes6.clear();
    this.providers.cubes7.clear();
    this.providers.cubes8.clear();
    this.providers.cubes9.clear();
    this.providers.cubes10.clear();
    this.providers.cubes11.clear();
    this.providers.cubes12.clear();
    this.providers.cubes13.clear();
    this.providers.cubes14.clear();
    this.providers.cubes15.clear();
    this.providers.cubes16.clear();
    this.providers.cubes17.clear();
    this.providers.labels.clear();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        xz: new Camera2D(),
        perspective: Camera.makePerspective({
          fov: (60 * Math.PI) / 180,
          far: 100000
        })
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.perspective,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: [
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.continuousSinusoidal(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes0,
              key: "cubes0"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatLinear(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes1,
              key: "cubes1"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInQuad(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes2,
              key: "cubes2"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatOutQuad(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes3,
              key: "cubes3"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInOutQuad(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes4,
              key: "cubes4"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInCubic(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes5,
              key: "cubes5"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatOutCubic(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes6,
              key: "cubes6"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInOutCubic(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes7,
              key: "cubes7"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInQuart(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes8,
              key: "cubes8"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatOutQuart(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes9,
              key: "cubes9"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInOutQuart(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes10,
              key: "cubes10"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInQuint(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes11,
              key: "cubes11"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatOutQuint(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes12,
              key: "cubes12"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatInOutQuint(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes13,
              key: "cubes13"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatOutElastic(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes14,
              key: "cubes14"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatBackIn(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes15,
              key: "cubes15"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatBackOut(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes16,
              key: "cubes16"
            }),
            createLayer(CubeLayer, {
              animate: {
                rotation: AutoEasingMethod.slerpQuatBackInOut(
                  this.duration,
                  this.delay,
                  this.loopStyle
                )
              },
              data: providers.cubes17,
              key: "cubes17"
            })
          ]
        },
        overlay: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.perspective,
              clearFlags: [ClearFlags.DEPTH]
            })
          },
          layers: {
            labels: createLayer2Din3D(Axis2D.XZ, LabelLayer, {
              data: providers.labels,
              resourceKey: resources.font.key,
              control2D: cameras.xz.control2D,
              scaleMode: ScaleMode.NEVER
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const labelTexts = [
      "continuousSinusoidal",
      "slerpQuatlinear",
      "slerpQuatInQuad",
      "slerpQuatOutQuad",
      "slerpQuatInOutQuad",
      "slerpQuatInCubic",
      "slerpQuatOutCubic",
      "slerpQuatInOutCubic",
      "slerpQuatInQuart",
      "slerpQuatOutQuart",
      "slerpQuatInOutQuart",
      "slerpQuatInQuint",
      "slerpQuatOutQuint",
      "slerpQuatInOutQuint",
      "slerpQuatOutElastic",
      "slerpQuatBackIn",
      "slerpQuatBackOut",
      "slerpQuatBackInOut"
    ];

    const q = eulerToQuat([0.7 * Math.PI, 0.2 * Math.PI, 0.1 * Math.PI]);

    const transforms: Transform[] = [];
    for (let i = 0; i < 18; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const transform = new Transform();
      transform.position = [-4.5 + col * 1.8, 2.1 - row * 2, 0];
      transforms.push(transform);

      this.providers.labels.add(
        new LabelInstance({
          origin: [-5 + col * 1.8, 1.4 - row * 2],
          fontSize: -0.15,
          anchor: {
            type: AnchorType.MiddleRight,
            padding: 0
          },
          text: labelTexts[i] || "",
          color: [1, 1, 1, 1]
        })
      );
    }

    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, -10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    this.providers.cubes0.add(
      new CubeInstance({
        transform: transforms[0],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes1.add(
      new CubeInstance({
        transform: transforms[1],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes2.add(
      new CubeInstance({
        transform: transforms[2],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes3.add(
      new CubeInstance({
        transform: transforms[3],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes4.add(
      new CubeInstance({
        transform: transforms[4],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes5.add(
      new CubeInstance({
        transform: transforms[5],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes6.add(
      new CubeInstance({
        transform: transforms[6],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes7.add(
      new CubeInstance({
        transform: transforms[7],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes8.add(
      new CubeInstance({
        transform: transforms[8],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes9.add(
      new CubeInstance({
        transform: transforms[9],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes10.add(
      new CubeInstance({
        transform: transforms[10],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes11.add(
      new CubeInstance({
        transform: transforms[11],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes12.add(
      new CubeInstance({
        transform: transforms[12],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes13.add(
      new CubeInstance({
        transform: transforms[13],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes14.add(
      new CubeInstance({
        transform: transforms[14],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.providers.cubes15.add(
      new CubeInstance({
        transform: transforms[15],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes16.add(
      new CubeInstance({
        transform: transforms[16],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );
    this.providers.cubes17.add(
      new CubeInstance({
        transform: transforms[17],
        size: [0.35, 0.35, 0.35],
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    // Wait for the cubes to get added before setting their destination value
    await onFrame();

    transforms[0].rotation = q;
    transforms[1].rotation = q;
    transforms[2].rotation = q;
    transforms[3].rotation = q;
    transforms[4].rotation = q;
    transforms[5].rotation = q;
    transforms[6].rotation = q;
    transforms[7].rotation = q;
    transforms[8].rotation = q;
    transforms[9].rotation = q;
    transforms[10].rotation = q;
    transforms[11].rotation = q;
    transforms[12].rotation = q;
    transforms[13].rotation = q;
    transforms[14].rotation = q;
    transforms[15].rotation = q;
    transforms[16].rotation = q;
    transforms[17].rotation = q;
  }
}
