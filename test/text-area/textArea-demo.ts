import * as datGUI from "dat.gui";
import {
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
  parameters = {
    text: `hello imaginationabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ yoyo, west virginia, washington lol, NFL abcedefg, a girl is no one
    how check it now, Valar Morghulis, Valar Dohaeris, mother of dragons7 blue, brown, green
    are you`,
    fontSize: 24,
    maxHeight: 510,
    maxWidth: 400,
    color: [0, 1, 0, 1],
    x: 0,
    y: 0,
    lineHeight: 30,
    lineWrap: 1
  };

  providers = {
    textAreas: new InstanceProvider<TextAreaInstance>()
  };

  textArea: TextAreaInstance;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    parameters.add(this.parameters, "text").onChange(() => {
      this.textArea.text = this.parameters.text;
    });

    parameters
      .add(this.parameters, "fontSize", 1, 50, 1)
      .onFinishChange((value: number) => {
        this.textArea.fontSize = value;
      });

    parameters
      .addColor(this.parameters, "color")
      .onChange((value: [number, number, number, number]) => {
        console.warn(value);
        if (value[0] > 1 || value[1] > 1 || value[2] > 1) {
          this.textArea.color = [
            value[0] / 255,
            value[1] / 255,
            value[2] / 255,
            1.0
          ];
        } else {
          this.textArea.color = value;
        }
      });

    parameters
      .add(this.parameters, "x", 0, 1000, 1)
      .onChange((value: number) => {
        this.textArea.origin = [value, this.textArea.origin[1]];
      });

    parameters
      .add(this.parameters, "y", 0, 500, 1)
      .onChange((value: number) => {
        this.textArea.origin = [this.textArea.origin[0], value];
      });

    parameters
      .add(this.parameters, "maxWidth", 20, 500, 1)
      .onChange((value: number) => {
        this.textArea.maxWidth = value;
      });

    parameters
      .add(this.parameters, "maxHeight", 20, 1000, 1)
      .onChange((value: number) => {
        this.textArea.maxHeight = value;
      });

    parameters
      .add(this.parameters, "lineHeight", 20, 1000, 1)
      .onChange((value: number) => {
        this.textArea.lineHeight = value;
      });

    parameters
      .add(this.parameters, "lineWrap", {
        None: 0,
        Normal: 1
      })
      .onChange((value: string) => {
        if (value === "0") {
          this.textArea.lineWrap = WordWrap.NONE;
        } else if (value === "1") {
          this.textArea.lineWrap = WordWrap.NORMAL;
        }
      });
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
        data: this.providers.textAreas,
        key: "textArea",
        scene: "default",
        resourceKey: resources.font.key
      })
    ];
  }

  async init() {
    const textArea = new TextAreaInstance({
      origin: [this.parameters.x, this.parameters.y],
      color: [
        this.parameters.color[0],
        this.parameters.color[1],
        this.parameters.color[2],
        this.parameters.color[3]
      ],
      fontSize: this.parameters.fontSize,
      text: this.parameters.text,
      maxWidth: this.parameters.maxWidth,
      maxHeight: this.parameters.maxHeight,
      lineHeight: this.parameters.lineHeight,
      lineWrap: this.parameters.lineWrap === 1 ? WordWrap.NORMAL : WordWrap.NONE
    });

    this.textArea = textArea;

    this.providers.textAreas.add(textArea);
  }
}
