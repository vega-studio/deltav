import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  ChartCamera,
  createLayer,
  InstanceProvider,
  ISceneOptions,
  LayerInitializer
} from "src";
import {
  TextAreaInstance,
  WordWrap
} from "src/base-layers/labels/text-area-instance";
import { TextAreaLayer } from "src/base-layers/labels/text-area-layer";
import { IDefaultResources } from "test/types";
import { BaseDemo } from "../common/base-demo";

export class TextAreaDemo extends BaseDemo {
  camera: ChartCamera;

  providers = {
    textAreas: new InstanceProvider<TextAreaInstance>()
  };

  buildConsole(gui: datGUI.GUI): void {
    gui;
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
      createLayer(TextAreaLayer, {
        animate: {
          origin: AutoEasingMethod.linear(1000)
        },
        data: this.providers.textAreas,
        key: "textArea",
        scene: "default",
        resourceKey: resources.font.key
      })
    ];
  }

  async init() {
    const textArea = new TextAreaInstance({
      origin: [70, 200],
      color: [0, 1, 0, 1],
      fontSize: 24,
      text:
        // "how are you, imagination! teacher mother father stranger library house throne game stark lanister Targerian Plano Dallas Mavericks Cowboys Stars Texas Rangers Frisco New York ",
        `hello imagination yoyo, west virginia, washington lol, NFL abcedefg, a girl is no one
           how check it now, Valar Morghulis, Valar Dohaeris, mother of dragons7 blue, brown, green
           are you`,
      maxWidth: 700,
      maxHeight: 120,
      lineHeight: 30,
      lineWrap: WordWrap.NORMAL
    });

    this.providers.textAreas.add(textArea);

    /*setInterval(() => {
      // textArea.color = [Math.random(), Math.random(), Math.random(), 1];
      // x += 10;
      // y += 10;
      // textArea.origin = [x, y];
      // textArea.lineWrap = textArea.lineWrap === WordWrap.NONE ? WordWrap.NORMAL : WordWrap.NONE;
      // width -= 20;
      // height -= 10;
      // textArea.maxWidth = width;
      // textArea.maxHeight = height;
    }, 5000);*/

    /*setTimeout(() => {
      textArea.lineWrap = WordWrap.NONE;
    }, 10000);*/
  }
}
