import * as datGUI from "dat.gui";
import {
  BasicCameraController,
  ChartCamera,
  createLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  ISceneOptions,
  LayerInitializer,
  ScaleMode
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { IDefaultResources } from "test/types";
import { debounce } from "../common/debounce";

const iconData = require("../kitchen-sink/examples/images/leaf.png");
const icon = new Image();
icon.src = iconData;
const sources = ["pic1.png", "pic2.png", "pic3.png", "pic4.png"];

export class ImageDemo extends BaseDemo {
  camera: ChartCamera;
  images: ImageInstance[] = [];

  parameters = {
    count: 100,
    previous: {
      count: 100
    },
    changeSome: () => {
      for (
        let i = 0, length = Math.min(50, this.parameters.count);
        i < length;
        i++
      ) {
        this.images[i].source =
          sources[Math.floor(Math.random() * sources.length)];
      }
    }
  };

  provider = {
    images: new InstanceProvider<ImageInstance>()
  };

  buildConsole(gui: datGUI.GUI) {
    const parameters = gui.addFolder("Parameters");

    parameters.add(this.parameters, "count", 0, 500, 1).onChange(
      debounce(async (value: number) => {
        const delta = value - this.parameters.previous.count;
        if (delta > 0) {
          for (let i = 0; i < delta; ++i) {
            this.makeImage();
          }
        }

        if (delta < 0) {
          for (let i = 0; i > delta; --i) {
            this.removeImage();
          }
        }

        this.parameters.previous.count = value;
      }, 250)
    );

    parameters.add(this.parameters, "changeSome");
  }

  getEventManagers(
    defaultController: BasicCameraController,
    _defaultCamera: ChartCamera
  ) {
    defaultController.wheelShouldScroll = true;
    return null;
  }

  getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null {
    this.camera = defaultCamera;
    return super.getScenes(defaultCamera);
  }

  getLayers(resources: IDefaultResources): LayerInitializer[] {
    return [
      createLayer(ImageLayer, {
        data: this.provider.images,
        key: "images",
        scene: "default",
        resourceKey: resources.atlas.key,
        scaleMode: ScaleMode.BOUND_MAX
      })
    ];
  }

  makeImage() {
    const image = this.provider.images.add(
      new ImageInstance({
        element: icon,
        id: `image${Math.random() * 9999}`,
        scaling: ScaleMode.ALWAYS,
        tint: [1.0, 1.0, 1.0, Math.random() * 0.8 + 0.2],
        source: sources[Math.floor(Math.random() * sources.length)]
      })
    );

    this.images.push(image);
  }

  removeImage() {
    // const image = this.images[Math.floor(Math.random() * this.images.length)];
    const image = this.images.pop();
    if (image) this.provider.images.remove(image);
  }

  async init() {
    // add new instance
    for (let i = 0, length = this.parameters.count; i < length; i++) {
      this.makeImage();
    }
  }
}
