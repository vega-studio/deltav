import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  BasicSurface,
  ChartCamera,
  ClearFlags,
  createLayer,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LabelInstance,
  LabelLayer,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  Vec2
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DEFAULT_RESOURCES } from "test/types";

import { Bin, BinType, BinValueType } from "./bin";

export class SandDanceDemo extends BaseDemo {
  camera: ChartCamera;

  parameters = {
    color: [0, 0, 255, 1] as [number, number, number, number],
    width: 6,
    changeLocations: () => {
      const file = require("./data.json");

      console.warn("file", file.length);

      const array = [];

      for (let i = 0; i < file.length; i++) {
        array.push(file[i]);
      }

      array.sort((a, b) => a.eyeColor.localeCompare(b.eyeColor));

      console.warn(array);
    }
  };

  providers = {
    bins: new InstanceProvider<RectangleInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  rectangles: RectangleInstance[] = [];
  binToRectangles: Map<RectangleInstance, RectangleInstance[]> = new Map();
  binRectangles: RectangleInstance[] = [];

  selectedRectangle: RectangleInstance | null = null;
  selectedBin: RectangleInstance | null = null;

  // I need an map element to rectangle

  mouseClick = (info: IPickInfo<RectangleInstance>) => {
    info.instances.forEach(instance => {
      if (!this.selectedRectangle || this.selectedRectangle !== instance) {
        this.selectedRectangle = instance;
        this.rectangles.forEach(
          instance => (instance.color = [0.1, 0.1, 0.1, 1])
        );
        instance.color = [1, 1, 1, 1];
      } else {
        this.selectedRectangle = null;
        this.rectangles.forEach(instance => (instance.color = [0, 0, 1, 1]));
      }
    });
  };

  mouseClickBin = (info: IPickInfo<RectangleInstance>) => {
    info.instances.forEach(instance => {
      if (!this.selectedBin || this.selectedBin !== instance) {
        this.selectedBin = instance;
        const rectangles = this.binToRectangles.get(instance);
        if (rectangles) {
          this.rectangles.forEach(
            instance => (instance.color = [0.1, 0.1, 0.1, 1])
          );
          rectangles.forEach(rect => (rect.color = [1, 1, 1, 1]));
        }
      } else {
        this.selectedBin = null;
        this.rectangles.forEach(instance => (instance.color = [0, 0, 1, 1]));
      }
    });
  };

  buildConsole(gui: datGUI.GUI) {
    const parameters = gui.addFolder("Parameters");

    parameters
      .addColor(this.parameters, "color")
      .onChange((value: [number, number, number, number]) => {
        this.rectangles.forEach(
          rec =>
            (rec.color = [value[0] / 255, value[1] / 255, value[2] / 255, 1])
        );
      });

    parameters.add(this.parameters, "changeLocations");
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new ChartCamera()
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      rendererOptions: {
        antialias: true
      },
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["default-view"],
          wheelShouldScroll: false
        })
      }),
      pipeline: (resources, providers, cameras) => ({
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
              labels: createLayer(LabelLayer, {
                data: providers.labels,
                resourceKey: resources.font.key
              }),
              lines: createLayer(EdgeLayer, {
                data: providers.lines,
                type: EdgeType.LINE
              }),
              rectangles: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(300),
                  location: AutoEasingMethod.linear(400)
                },
                data: providers.rectangles,
                onMouseClick: this.mouseClick,
                picking: PickType.SINGLE
              }),
              bins: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(300)
                },
                data: providers.bins,
                onMouseClick: this.mouseClickBin,
                picking: PickType.SINGLE
              })
            }
          }
        }
      })
    });
  }

  getBinValues(numberValues: Set<number>, stringValues: Set<string>) {
    const maxBinNumber = 6;
    let binNum = 0;
    let binValueType: string = "";

    if (numberValues.size > 0) {
      binNum = numberValues.size;
      binValueType = "number";
    } else if (stringValues.size > 0) {
      binNum = stringValues.size;
      binValueType = "string";
    }

    const bins: Bin[] = [];

    if (binNum > 0 && binNum <= maxBinNumber) {
      if (binValueType === "number") {
        const valueArray = Array.from(numberValues);
        valueArray.sort((a, b) => a - b);
        for (let i = 0; i < valueArray.length; i++) {
          const value = valueArray[i];
          bins.push(
            new Bin({
              type: BinType.SINGLE,
              valueType: BinValueType.NUMBER,
              value
            })
          );
        }
      } else if (binValueType === "string") {
        const valueArray = Array.from(stringValues);
        valueArray.sort((a, b) => a.localeCompare(b));
        for (let i = 0; i < valueArray.length; i++) {
          const value = valueArray[i];
          bins.push(
            new Bin({
              type: BinType.SINGLE,
              valueType: BinValueType.STRING,
              value
            })
          );
        }
      }
    } else {
      if (binValueType === "number") {
        const valueArray = Array.from(numberValues);
        let minValue = valueArray[0];
        let maxValue = valueArray[0];
        numberValues.forEach(value => {
          if (value > maxValue) maxValue = value;
          if (value < minValue) minValue = value;
        });

        console.warn(`${minValue}  ${maxValue}`);

        const binBasicWidth = Math.floor(
          (maxValue + 1 - minValue) / maxBinNumber
        );
        const rest = maxValue + 1 - minValue - maxBinNumber * binBasicWidth;
        let start = minValue;
        for (let i = 0; i < maxBinNumber; i++) {
          let binWidth = binBasicWidth;
          if (i < rest) binWidth++;
          bins.push(
            new Bin({
              type: BinType.RANGE,
              valueType: BinValueType.NUMBER,
              value: [start, start + binWidth - 1]
            })
          );
          start += binWidth;
        }
      } else if (binValueType === "string") {
        const valueArray = Array.from(stringValues);
        let minValue = valueArray[0][0].toLocaleLowerCase().charCodeAt(0);
        let maxValue = valueArray[0][0].toLocaleLowerCase().charCodeAt(0);
        stringValues.forEach(value => {
          const c = value[0].toLocaleLowerCase();
          const cValue = c.charCodeAt(0);
          if (cValue > maxValue) {
            maxValue = cValue;
          }
          if (cValue < minValue) {
            minValue = cValue;
          }
        });

        const binBasicWidth = Math.floor(
          (maxValue + 1 - minValue) / maxBinNumber
        );
        const rest = maxValue + 1 - minValue - maxBinNumber * binBasicWidth;
        let start = minValue;
        for (let i = 0; i < maxBinNumber; i++) {
          let binWidth = binBasicWidth;
          if (i < rest) binWidth++;

          bins.push(
            new Bin({
              type: BinType.RANGE,
              valueType: BinValueType.STRING,
              value: [
                String.fromCharCode(start),
                String.fromCharCode(start + binWidth - 1)
              ]
            })
          );
          start += binWidth;
        }
      }
    }

    return bins;
  }

  buildGraph() {
    const file = require("./data.json");
    const totalNum = file.length;
    const keys: string[] = [];

    // getKeys value and create Instance
    const array = [];
    const idToRectangle: Map<number, RectangleInstance> = new Map<
      number,
      RectangleInstance
    >();

    // get values of keys[1]
    // use different kind of set
    const numberValues: Set<number> = new Set<number>();
    const stringValues: Set<string> = new Set<string>();

    // get keys
    if (totalNum > 0) {
      for (const key in file[0]) {
        keys.push(key);
      }
    }

    const key = keys[0];

    // Create the rectangleInstances
    for (let i = 0; i < file.length; i++) {
      const element = file[i];
      array.push(element);
      const value = element[key];
      if (typeof value === "string") {
        stringValues.add(element[key]);
      } else if (typeof value === "number") {
        numberValues.add(element[key]);
      }

      const rec = new RectangleInstance({
        depth: 0,
        size: [10, 10],
        scaling: ScaleMode.ALWAYS,
        color: this.parameters.color
      });

      this.providers.rectangles.add(rec);
      this.rectangles.push(rec);

      idToRectangle.set(element.id, rec);
    }

    const origin: Vec2 = [10, 800];
    const chartWidth: number = 1200;
    const chartHeight: number = 600;

    const bins = this.getBinValues(numberValues, stringValues);
    const binNum = bins.length;
    const binWidth = chartWidth / binNum;
    const rowNum: number = Math.floor(binWidth / 11);

    // Sorting based on value type
    if (stringValues.size > 0) {
      array.sort((a, b) => a[key].localeCompare(b[key]));
    }

    if (numberValues.size > 0) {
      array.sort((a, b) => a[key] - b[key]);
    }

    // bins
    this.layoutBins(binNum, binWidth, origin);

    // Rectangles
    this.layoutRectangles(
      bins,
      array,
      key,
      binWidth,
      rowNum,
      origin,
      idToRectangle
    );

    // lines
    this.layoutLines(origin, chartWidth, chartHeight);

    // labels
    this.layoutLabels(bins, origin, binWidth);
  }

  layoutBins(binNum: number, binWidth: number, origin: [number, number]) {
    for (let i = 0; i < binNum; i++) {
      const binRec = new RectangleInstance({
        depth: 0,
        position: [origin[0] + binWidth * i, origin[1] + 20],
        size: [binWidth - 5, 20],
        scaling: ScaleMode.ALWAYS,
        color: [0.5, 0.5, 0.5, 1]
      });

      this.binToRectangles.set(binRec, []);

      this.providers.bins.add(binRec);

      this.binRectangles.push(binRec);
    }
  }

  layoutRectangles(
    bins: Bin[],
    array: any[],
    key: number | string,
    binWidth: number,
    rowNum: number,
    origin: [number, number],
    idToRectangle: Map<number, RectangleInstance>
  ) {
    let curIndex = 0;
    let currentBin = bins[curIndex];
    let currentBinRec = this.binRectangles[curIndex];

    let currentX = 0;
    let currentY = 0;
    let rowIndex = 0;

    // layout Rectangles
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      const rec = idToRectangle.get(element.id);

      if (rec) {
        const keyValue = element[key];

        while (curIndex < bins.length && !currentBin.containsValue(keyValue)) {
          curIndex++;
          currentBin = bins[curIndex];
          currentBinRec = this.binRectangles[curIndex];

          rowIndex = 0;
          currentX = binWidth * curIndex;
          currentY = 0;

          // console.warn(currentBin.value);
        }

        rec.position = [origin[0] + currentX, origin[1] - currentY];

        const list = this.binToRectangles.get(currentBinRec);
        if (list) {
          list.push(rec);
          this.binToRectangles.set(currentBinRec, list);
        }

        rowIndex++;

        if (rowIndex >= rowNum) {
          rowIndex = 0;
          currentX = binWidth * curIndex;
          currentY += 11;
        } else {
          currentX += 11;
        }
      }
    }
  }

  layoutLines(
    origin: [number, number],
    chartWidth: number,
    chartHeight: number
  ) {
    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0] + chartWidth, origin[1] + 10]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0], origin[1] - chartHeight + 10]
      })
    );
  }

  layoutLabels(bins: Bin[], origin: [number, number], binWidth: number) {
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      let labelText = "";
      if (bin.type === BinType.SINGLE) {
        labelText = bin.value.toString();
      } else {
        if (typeof bin.value === "object") {
          labelText = `${bin.value[0]} - ${bin.value[1]}`;
        }
      }
      const label = new LabelInstance({
        text: labelText,
        color: [1, 1, 1, 1],
        origin: [origin[0] + binWidth * i, origin[1] + 40],
        fontSize: 24
      });
      this.providers.labels.add(label);
    }
  }

  async init() {
    console.warn(typeof [1, 1]);
    this.buildGraph();
    /*const totalNum = 1000;

    const bins = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < totalNum; i++) {
      const index = Math.floor(Math.random() * 8);
      bins[index]++;
    }

    const origin: Vec2 = [100, 800];
    const chartWidth: number = 800;
    const chartHeight: number = 600;
    const binNum = 8;
    const binWidth = chartWidth / binNum;
    const rowNum: number = 8;

    for (let i = 0; i < bins.length; i++) {
      const rec = new RectangleInstance({
        depth: 0,
        position: [origin[0] + binWidth * i, origin[1] + 20],
        size: [binWidth - 5, 20],
        scaling: ScaleMode.ALWAYS,
        color: [0.5, 0.5, 0.5, 1]
      });

      this.providers.bins.add(rec);

      this.binRectangles.push(rec);
    }

    // Rectangles
    for (let i = 0; i < bins.length; i++) {
      const binOrigin = [origin[0] + binWidth * i, origin[1]];

      const list = [];

      for (let j = 0; j < bins[i]; j++) {
        const row = j % 8;
        const col = Math.floor(j / rowNum);
        const rec = new RectangleInstance({
          depth: 0,
          position: [binOrigin[0] + row * 11, binOrigin[1] - col * 11],
          size: [10, 10],
          scaling: ScaleMode.ALWAYS,
          color: this.parameters.color
        });

        list.push(rec);

        this.providers.rectangles.add(rec);

        this.rectangles.push(rec);
      }

      this.binToRectangles.set(this.binRectangles[i], list);
    }

    // Lines
    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0] + chartWidth, origin[1] + 10]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0], origin[1] - chartHeight + 10]
      })
    );

    // Labels
    this.providers.labels.add(
      new LabelInstance({
        text: "Test",
        color: [1, 1, 1, 1],
        origin: [100, 100],
        fontSize: 24
      })
    );*/
  }
}
