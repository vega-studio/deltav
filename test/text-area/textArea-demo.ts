import * as datGUI from "dat.gui";
import {
  BasicCameraController,
  ChartCamera,
  createLayer,
  InstanceProvider,
  ISceneOptions,
  LayerInitializer,
  Vec1Compat
} from "src";
import {
  TextAreaInstance,
  WordWrap
} from "src/base-layers/labels/text-area-instance";
import { TextAreaLayer } from "src/base-layers/labels/text-area-layer";
import { IDefaultResources, STORY } from "test/types";
import { BaseDemo } from "../common/base-demo";

const texts = [
  `ohello imaginationabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ yoyo, west virginia, washington lol, NFL abcedefg, a girl is no one
  how check it now, Valar Morghulis, Valar Dohaeris, mother of dragons7 blue, brown, green
  are you`,
  `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.()*&^%$#@!<>?":"[]`,
  ` A B C D E F G a b c d e f g 1 2 3 4 5 6 7 8 9`,
  `Here are the 10 counties with populations of at least 10,000 with the biggest population increases from domestic migration per 1,000 residents. Three of the top 10 counties are in Florida, and another three are in Texas:`,
  STORY,
  `Good morning, Ozarka Easy open top, Made in Texas, amazon, tissue, Summit, ABDUL-Jabbar, Malone, Bryant, Jordan, Nowitzki`,
  `What he was referencing, in particular, was Jaden Schwartz's third-period goal over a prone Bishop. The goalie was writhing in the crease after a previous shot clanged off his left collarbone. The officials didn't stop play after Bishop went down, befuddling at least a few Stars, apparently, because another goal soon followed.`,
  `Or any, for that matter. The Stars didn't have much creativity Sunday. None they could capitalize on, at least. Like in the second period, when talented young Miro Heiskanen slipped a pass to Jamie Benn, who whiffed, point blank.`
];

export class TextAreaDemo extends BaseDemo {
  camera: ChartCamera;
  parameters = {
    text: texts[Math.floor(Math.random() * texts.length)],
    fontSize: 24,
    maxHeight: 510,
    maxWidth: 375,
    color: [0, 1, 0, 1],
    x: 0,
    y: 0,
    lineHeight: 30,
    lineWrap: 1,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    borderWidth: 1,
    hasBorder: true
  };

  providers = {
    textAreas: new InstanceProvider<TextAreaInstance>()
  };

  textAreas: TextAreaInstance[] = [];

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    parameters.add(this.parameters, "text").onChange(() => {
      this.textAreas[0].text = this.parameters.text;
    });

    parameters
      .add(this.parameters, "fontSize", 1, 50, 1)
      .onFinishChange((value: number) => {
        this.textAreas.forEach(textArea => {
          textArea.fontSize = value;
        });
      });

    parameters
      .addColor(this.parameters, "color")
      .onChange((value: [number, number, number, number]) => {
        this.textAreas.forEach(textArea => {
          if (value[0] > 1 || value[1] > 1 || value[2] > 1) {
            textArea.color = [
              value[0] / 255,
              value[1] / 255,
              value[2] / 255,
              1.0
            ];
          } else {
            textArea.color = value;
          }
        });
      });

    parameters
      .add(this.parameters, "x", 0, 1000, 1)
      .onChange((value: number) => {
        this.textAreas[0].origin = [value, this.textAreas[0].origin[1]];
      });

    parameters
      .add(this.parameters, "y", 0, 500, 1)
      .onChange((value: number) => {
        this.textAreas[0].origin = [this.textAreas[0].origin[0], value];
      });

    parameters
      .add(this.parameters, "maxWidth", 20, 1000, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => (textArea.maxWidth = value));
      });

    parameters
      .add(this.parameters, "maxHeight", 20, 1000, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => (textArea.maxHeight = value));
      });

    parameters
      .add(this.parameters, "lineHeight", 20, 1000, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => (textArea.lineHeight = value));
      });

    parameters
      .add(this.parameters, "lineWrap", {
        None: 0,
        Normal: 1
      })
      .onChange((value: string) => {
        this.textAreas.forEach(textArea => {
          if (value === "0") {
            textArea.lineWrap = WordWrap.NONE;
          } else if (value === "1") {
            textArea.lineWrap = WordWrap.NORMAL;
          }
        });
      });

    parameters
      .add(this.parameters, "paddingTop", 0, 20, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => {
          const newPaddings: Vec1Compat = [
            value,
            textArea.paddings[1] || 0,
            textArea.paddings[2] || 0,
            textArea.paddings[3] || 0
          ];

          textArea.paddings = newPaddings;
        });
      });

    parameters
      .add(this.parameters, "paddingRight", 0, 20, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => {
          const newPaddings: Vec1Compat = [
            textArea.paddings[0],
            value,
            textArea.paddings[2] || 0,
            textArea.paddings[3] || 0
          ];

          textArea.paddings = newPaddings;
        });
      });

    parameters
      .add(this.parameters, "paddingBottom", 0, 20, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => {
          const newPaddings: Vec1Compat = [
            textArea.paddings[0],
            textArea.paddings[1] || 0,
            value,
            textArea.paddings[3] || 0
          ];

          textArea.paddings = newPaddings;
        });
      });

    parameters
      .add(this.parameters, "paddingLeft", 0, 20, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => {
          const newPaddings: Vec1Compat = [
            textArea.paddings[0],
            textArea.paddings[1] || 0,
            textArea.paddings[2] || 0,
            value
          ];

          textArea.paddings = newPaddings;
        });
      });

    parameters
      .add(this.parameters, "borderWidth", 1, 30, 1)
      .onChange((value: number) => {
        this.textAreas.forEach(textArea => (textArea.borderWidth = value));
      });

    parameters.add(this.parameters, "hasBorder").onChange((value: boolean) => {
      this.textAreas.forEach(textArea => (textArea.hasBorder = value));
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
    for (let i = 0; i < 8; i++) {
      const x = i % 4;
      const y = Math.floor(i / 4);
      const textArea = new TextAreaInstance({
        origin: [this.parameters.maxWidth * x, this.parameters.maxHeight * y],
        color: [
          this.parameters.color[0],
          this.parameters.color[1],
          this.parameters.color[2],
          this.parameters.color[3]
        ],
        fontSize: this.parameters.fontSize,
        text: texts[i],
        maxWidth: this.parameters.maxWidth,
        maxHeight: this.parameters.maxHeight,
        lineHeight: this.parameters.lineHeight,
        lineWrap:
          this.parameters.lineWrap === 1 ? WordWrap.NORMAL : WordWrap.NONE,
        paddings: [
          this.parameters.paddingTop,
          this.parameters.paddingRight,
          this.parameters.paddingBottom,
          this.parameters.paddingLeft
        ],
        borderWidth: this.parameters.borderWidth,
        hasBorder: this.parameters.hasBorder
      });

      this.textAreas.push(textArea);
      this.providers.textAreas.add(textArea);
    }
  }
}
