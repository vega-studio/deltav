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
import { Person } from "./person";

export class SandDanceDemo extends BaseDemo {
  camera: ChartCamera;

  gui: datGUI.GUI;

  parameters = {
    count: 1000,
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
    },
    sortBy: "null"
  };

  persons: Person[] = [];

  providers = {
    bins: new InstanceProvider<RectangleInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  rectangles: RectangleInstance[] = [];

  binToRectangles: Map<RectangleInstance, RectangleInstance[]> = new Map();
  bins: Bin[];
  binRectangles: RectangleInstance[] = [];
  binToLocation: Map<Bin, [number, number]> = new Map();

  idToRectangle: Map<number, RectangleInstance> = new Map<
    number,
    RectangleInstance
  >();

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

    parameters
      .add(this.parameters, "count", 0, 10000, 1)
      .onFinishChange((value: number) => {
        console.warn(value, this.parameters.count);
        if (value > this.persons.length) {
          console.warn("addddd");
          this.addPersons(value - this.persons.length);
        }
      });

    this.gui = gui;
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
                  location: AutoEasingMethod.easeInOutCubic(3000)
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

  initGraph() {
    this.providers.labels.clear();
    this.providers.bins.clear();
    this.binToRectangles.clear();
    this.selectedBin = null;
    this.selectedRectangle = null;
    this.binRectangles = [];
  }

  sortByKey(file: any, key: string) {
    this.initGraph();

    const array = [];
    const numberValues: Set<number> = new Set<number>();
    const stringValues: Set<string> = new Set<string>();

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

      if (!this.idToRectangle.has(element.id)) {
        const rec = new RectangleInstance({
          depth: 0,
          size: [10, 10],
          scaling: ScaleMode.ALWAYS,
          color: this.parameters.color
        });

        this.providers.rectangles.add(rec);
        this.rectangles.push(rec);

        this.idToRectangle.set(element.id, rec);
      }
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
    this.layoutRectangles(bins, array, key, binWidth, rowNum, origin);

    // lines
    this.layoutLines(origin, chartWidth, chartHeight);

    // labels
    this.layoutLabels(bins, origin, binWidth);
  }

  buildGraph() {
    const file = require("./data.json");
    const totalNum = file.length;
    const keys: string[] = [];

    // get keys
    if (totalNum > 0) {
      for (const key in file[0]) {
        keys.push(key);
      }
    }

    this.sortByKey(file, keys[0]);

    this.gui
      .add(this.parameters, "sortBy", keys)
      .setValue(keys[0])
      .onChange((key: string) => {
        this.sortByKey(file, key);
      });
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

  layoutRectangles2(
    bins: Bin[],
    array: Person[],
    key: number | string,
    binWidth: number,
    rowNum: number,
    origin: [number, number]
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
      const rec = this.idToRectangle.get(element.id);

      if (rec) {
        const keyValue = element[key];

        while (curIndex < bins.length && !currentBin.containsValue(keyValue)) {
          curIndex++;
          currentBin = bins[curIndex];
          currentBinRec = this.binRectangles[curIndex];

          rowIndex = 0;
          currentX = binWidth * curIndex;
          currentY = 0;

          this.binToLocation.set(currentBin, [currentX, currentY]);
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

        this.binToLocation.set(currentBin, [currentX, currentY]);
      }
    }
  }

  layoutRectangles(
    bins: Bin[],
    array: any[],
    key: number | string,
    binWidth: number,
    rowNum: number,
    origin: [number, number]
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
      const rec = this.idToRectangle.get(element.id);

      if (rec) {
        const keyValue = element[key];

        while (curIndex < bins.length && !currentBin.containsValue(keyValue)) {
          curIndex++;
          currentBin = bins[curIndex];
          currentBinRec = this.binRectangles[curIndex];

          rowIndex = 0;
          currentX = binWidth * curIndex;
          currentY = 0;
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

  generatePersons() {
    const eyeColors = ["blue", "black", "brown", "green"];

    for (let i = 0; i < this.parameters.count; i++) {
      const person = new Person({
        id: i,
        age: 20 + Math.floor(20 * Math.random()),
        eyeColor: eyeColors[Math.floor(eyeColors.length * Math.random())],
        name: String.fromCharCode(97 + Math.floor(26 * Math.random())),
        gender: Math.random() >= 0.5 ? "male" : "female",
        group: Math.floor(6 * Math.random()) + 1
      });

      this.persons.push(person);

      // generate the rectangle the person represents
      const rec = new RectangleInstance({
        depth: 0,
        size: [10, 10],
        scaling: ScaleMode.ALWAYS,
        color: this.parameters.color
      });

      this.providers.rectangles.add(rec);
      this.rectangles.push(rec);

      this.idToRectangle.set(person.id, rec);
    }

    const keys: string[] = [];

    if (this.persons.length > 0) {
      for (const key in this.persons[0]) {
        keys.push(key);
      }
    }

    this.sortByKey2(keys[1]);
  }

  sortByKey2(key: string) {
    this.initGraph();

    const array = [];
    const numberValues: Set<number> = new Set<number>();
    const stringValues: Set<string> = new Set<string>();

    for (let i = 0; i < this.persons.length; i++) {
      const element: Person = this.persons[i];
      array.push(element);
      const value = element[key];

      if (typeof value === "string") {
        stringValues.add(value);
      } else if (typeof value === "number") {
        numberValues.add(value);
      }
    }

    const origin: Vec2 = [10, 800];
    const chartWidth: number = 1200;
    const chartHeight: number = 600;

    this.bins = this.getBinValues(numberValues, stringValues);
    const binNum = this.bins.length;
    const binWidth = chartWidth / binNum;
    const rowNum: number = Math.floor(binWidth / 11);

    // Sorting based on value type
    if (stringValues.size > 0) {
      array.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        return 0;
      });
    }

    if (numberValues.size > 0) {
      array.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        return 0;
      });
    }

    // bins
    this.layoutBins(binNum, binWidth, origin);

    // Rectangles
    this.layoutRectangles2(this.bins, array, key, binWidth, rowNum, origin);

    // lines
    this.layoutLines(origin, chartWidth, chartHeight);

    // labels
    this.layoutLabels(this.bins, origin, binWidth);
  }

  addPersons(toAdd: number) {
    const eyeColors = ["blue", "black", "brown", "green"];
    // Create new person
    for (let i = 0; i < toAdd; i++) {
      const person = new Person({
        id: this.persons.length + i, // temp
        age: 20 + Math.floor(20 * Math.random()),
        eyeColor: eyeColors[Math.floor(eyeColors.length * Math.random())],
        name: String.fromCharCode(97 + Math.floor(26 * Math.random())),
        gender: Math.random() >= 0.5 ? "male" : "female",
        group: Math.floor(6 * Math.random()) + 1
      });

      this.persons.push(person);

      // generate the rectangle the person represents
      const rec = new RectangleInstance({
        depth: 0,
        size: [10, 10],
        scaling: ScaleMode.ALWAYS,
        color: this.parameters.color
      });

      rec.position = [100, 90];

      this.providers.rectangles.add(rec);
      this.rectangles.push(rec);

      this.idToRectangle.set(person.id, rec);

      // Move it to right location
      const keys: string[] = [];

      if (this.persons.length > 0) {
        for (const key in this.persons[0]) {
          keys.push(key);
        }
      }

      const key = keys[1];

      for (let i = 0; i < this.bins.length; i++) {
        if (this.bins[i].containsValue(person[key])) {
          const location = this.binToLocation.get(this.bins[i]);
          if (location) {
            rec.position = [location[0], location[1] + 30];
          }
        }
      }
    }
  }

  reducePerson(toReduce: number) {
    // Make those recs disappear
    // Relayout
  }

  moveRectangles(key: string) {
    // Chunk by chunk
  }

  async init() {
    this.generatePersons();
    // this.buildGraph();
  }
}
