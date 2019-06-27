import * as datGUI from "dat.gui";
import {
  BasicCameraController,
  BasicSurface,
  ChartCamera,
  ClearFlags,
  copy2,
  createAtlas,
  createLayer,
  createView,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  PickType,
  ScaleMode,
  TextureSize,
  Vec2
} from "src";
import { wait } from "../../../src/util/wait";
import { BaseDemo } from "../../common/base-demo";

function rand() {
  return Math.random();
}

const assets = {
  Wildlife: require("../../assets/Wildlife.mp4"),
  Waterfall: require("../../assets/Waterfall.mp4"),
  play: new Image(),
  pause: new Image(),
  mute: new Image(),
  unmute: new Image()
};

assets.play.src = require("../../assets/play.png");
assets.pause.src = require("../../assets/pause.png");
assets.mute.src = require("../../assets/mute.png");
assets.unmute.src = require("../../assets/unmute.png");

/**
 * A demo showing the use of video as a texture. In this case rendered as a simple image.
 */
export class VideoDemo extends BaseDemo {
  /** Surface providers */
  providers = {
    controls: new InstanceProvider<ImageInstance>(),
    images: new InstanceProvider<ImageInstance>()
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
    mute: new ImageInstance({
      height: 20,
      tint: [1, 1, 1, 1],
      source: assets.mute,
      onReady: this.onImageReady
    }),
    play: new ImageInstance({
      height: 20,
      tint: [1, 1, 1, 1],
      source: assets.play,
      onReady: this.onImageReady
    })
  };

  onImageReady(image: ImageInstance) {
    const aspect = image.sourceWidth / image.sourceHeight;
    image.width = image.height * aspect;
  }

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "source", {
        WildLife: assets.Wildlife,
        Waterfall: assets.Waterfall
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
          width: TextureSize._2048,
          height: TextureSize._2048
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
              boxes: createLayer(ImageLayer, {
                data: providers.controls,
                picking: PickType.SINGLE,
                atlas: resources.atlas.key,

                onMouseClick: info => {
                  const instance = info.instances[0];

                  if (this.video && instance === this.controls.mute) {
                    this.video.muted = !this.video.muted;
                    this.updateMuteState();
                  } else if (instance === this.controls.play) {
                    if (this.video) {
                      if (this.video.paused) {
                        this.video.play().catch(_err => {
                          if (this.video) {
                            this.video.load();
                          }
                        });
                      } else {
                        this.video.pause();
                      }
                    } else {
                      this.videoInstance.videoLoad();
                    }

                    this.updatePlayState();
                  }
                }
              })
            }
          }
        }
      })
    });
  }

  updateMuteState() {
    if (!this.video || this.video.muted) {
      this.controls.mute.source = assets.mute;
    } else {
      this.controls.mute.source = assets.unmute;
    }
  }

  updatePlayState() {
    if (!this.video || this.video.paused) {
      this.controls.play.source = assets.play;
    } else {
      this.controls.play.source = assets.pause;
    }
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
      const origin: Vec2 = [rand() * screen[0], rand() * screen[1]];
      const scale = Math.random() * 0.8 + 0.2;

      this.videoInstance = this.providers.images.add(
        new ImageInstance({
          source: videoSrc,
          tint: [rand(), rand(), rand(), 1],
          origin: copy2(origin),
          scaling: ScaleMode.ALWAYS,

          onReady: async (image: ImageInstance, video?: HTMLVideoElement) => {
            if (!video) {
              return;
            }

            this.videoInstance = image;
            this.video = video;

            const max = Math.max(this.video.videoWidth, this.video.videoHeight);
            const adjustedScale = Math.min(500 / max, scale);

            image.width = this.video.videoWidth * adjustedScale;
            image.height = this.video.videoHeight * adjustedScale;

            image.origin[0] = origin[0] - image.width / 2;
            image.origin[1] = origin[1] - image.height / 2;

            this.updateMuteState();
            this.updatePlayState();
          }
        })
      );

      this.images.push(this.videoInstance);
    }

    Object.values(this.controls).forEach((control, i) => {
      control.origin = [10 + i * 30, screen[1] - 30];
      this.providers.controls.add(control);
    });

    this.updateMuteState();
    this.updatePlayState();
  }
}
