import * as datGUI from "dat.gui";
import {
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createAtlas,
  createLayer,
  createView,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  nextFrame,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  TextureSize,
  Vec2,
  View2D
} from "src";
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

  video?: HTMLVideoElement;

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

  buildConsole(_gui: datGUI.GUI): void {
    // const parameters = gui.addFolder("Parameters");
    // parameters
    //   .add(this.parameters, "radius", 0, 10000, 1)
    //   .onChange(async (_value: number) => {
    //     this.moveToLocation(this.currentLocation);
    //   });
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {
        atlas: createAtlas({
          width: TextureSize._2048,
          height: TextureSize._2048
        })
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"]
        })
      }),
      pipeline: (resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              main: createView(View2D, {
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
              main: createView(View2D, {
                camera: new Camera2D(),
                clearFlags: [ClearFlags.DEPTH]
              })
            },
            layers: {
              boxes: createLayer(RectangleLayer, {
                data: providers.boxes,
                picking: PickType.SINGLE,

                onMouseClick: info => {
                  if (this.video && info.instances.length > 0) {
                    this.video.muted = !this.video.muted;

                    if (this.video.muted) {
                      info.instances.forEach(box => (box.color = [1, 0, 0, 1]));
                    } else {
                      info.instances.forEach(box => (box.color = [0, 1, 0, 1]));
                    }
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
    if (!this.surface) return;
    await this.surface.ready;
    const screen = this.surface.getViewScreenSize("main.main");

    const videoSrc = {
      videoSrc: require("../../assets/Wildlife.mp4")
    };

    for (let i = 0; i < 100; ++i) {
      this.providers.images.add(
        new ImageInstance({
          source: videoSrc,
          tint: [rand(), rand(), rand(), 1],
          origin: [rand() * screen[0], rand() * screen[1]],
          scaling: ScaleMode.ALWAYS,

          onReady: async (image: ImageInstance) => {
            if (
              !image.request ||
              !image.request.texture ||
              !(image.request.texture.source instanceof HTMLVideoElement)
            ) {
              return;
            }
            this.video = image.request.texture.source;
            const scale = Math.random() * 0.8 + 0.2;
            image.width = this.video.videoWidth * scale;
            image.height = this.video.videoHeight * scale;
            image.origin[0] = image.origin[0] - image.width / 2;
            image.origin[1] = image.origin[1] - image.height / 2;

            if (this.video.paused) {
              this.video.play();
              this.video.loop = true;
              await nextFrame();
              // console.log("IS PAUSED", this.video.paused);
            }
          }
        })
      );
    }

    Object.values(this.controls).forEach((box, i) => {
      box.position = [10 + i * 30, screen[1] - 30];
      this.providers.boxes.add(box);
    });
  }
}
