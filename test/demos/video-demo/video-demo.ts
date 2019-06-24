import * as datGUI from "dat.gui";
import {
  BasicCameraController,
  BasicSurface,
  ChartCamera,
  ClearFlags,
  createAtlas,
  createLayer,
  createView,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  TextureSize,
  Vec2
} from "src";
import { wait } from "../../../src/util/wait";
import { BaseDemo } from "../../common/base-demo";

function rand() {
  return Math.random();
}

/**
 * A demo showing the use of video as a texture. In this case rendered as a simple image.
 */
export class VideoDemo extends BaseDemo {
  /** Surface providers */
  providers = {
    images: new InstanceProvider<ImageInstance>(),
    boxes: new InstanceProvider<RectangleInstance>()
  };

  /** All images produced */
  images: ImageInstance[] = [];

  /** GUI properties */
  parameters = {
    source: require("../../assets/Wildlife.mp4")
  };

  currentLocation: Vec2 = [0, 0];

  video?: HTMLVideoElement;
  videoInstance: ImageInstance;

  controls = {
    mute: new RectangleInstance({
      size: [20, 20],
      color: [1, 0, 0, 1]
    }),
    play: new RectangleInstance({
      size: [20, 20],
      color: [1, 0, 0, 1]
    })
  };

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "source", {
        WildLife: require("../../assets/Wildlife.mp4"),
        HamRadio: require("../../assets/Waterfall.mp4")
      })
      .onChange(async (value: string) => {
        this.images.forEach(image => {
          image.source = {
            videoSrc: value,
            autoPlay: true
          };
        });
      });
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new ChartCamera()
      },
      resources: {
        atlas: createAtlas({
          width: TextureSize._1024,
          height: TextureSize._1024
        })
      },
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["main.main"]
        })
      }),
      pipeline: (resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              main: createView({
                camera: cameras.main,
                background: [0, 0, 0, 1],
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              video: createLayer(ImageLayer, {
                data: providers.images,
                atlas: resources.atlas.key
              })
            }
          },
          screen: {
            views: {
              main: createView({
                camera: new ChartCamera(),
                clearFlags: [ClearFlags.DEPTH]
              })
            },
            layers: {
              boxes: createLayer(RectangleLayer, {
                data: providers.boxes,
                picking: PickType.SINGLE,

                onMouseClick: info => {
                  const instance = info.instances[0];

                  if (this.video && instance === this.controls.mute) {
                    this.video.muted = !this.video.muted;

                    if (this.video.muted) {
                      instance.color = [1, 0, 0, 1];
                    } else {
                      instance.color = [0, 1, 0, 1];
                    }
                  } else if (instance === this.controls.play) {
                    if (this.video) this.video.play();
                    else this.videoInstance.videoLoad();
                  }
                }
              })
            }
          }
        }
      })
    });
  }

  async init() {
    await wait(1000);
    if (!this.surface) return;
    await this.surface.ready;
    const screen = this.surface.getViewScreenSize("main.main");

    const videoSrc = {
      videoSrc: this.parameters.source,
      autoPlay: true
    };

    for (let i = 0; i < 10; ++i) {
      this.videoInstance = this.providers.images.add(
        new ImageInstance({
          source: videoSrc,
          tint: [rand(), rand(), rand(), 1],
          origin: [rand() * screen[0], rand() * screen[1]],
          scaling: ScaleMode.ALWAYS,

          onReady: async (image: ImageInstance, video?: HTMLVideoElement) => {
            if (!video) {
              return;
            }

            this.videoInstance = image;
            this.video = video;
            let scale = Math.random() * 0.8 + 0.2;

            const max = Math.max(this.video.videoWidth, this.video.videoHeight);
            scale = Math.min(500 / max, scale);

            image.width = this.video.videoWidth * scale;
            image.height = this.video.videoHeight * scale;

            image.origin[0] = image.origin[0] - image.width / 2;
            image.origin[1] = image.origin[1] - image.height / 2;
          }
        })
      );

      this.images.push(this.videoInstance);
    }

    Object.values(this.controls).forEach((box, i) => {
      box.position = [10 + i * 30, screen[1] - 30];
      this.providers.boxes.add(box);
    });
  }
}
