import {
  EdgeInstance,
  InstanceProvider,
  LabelInstance,
  RectangleInstance,
  ScaleMode,
  Vec2,
  Vec4
} from "src";
import { Bin, BinType, BinValueType } from "./bin";
import { Person } from "./person";

export interface ISandDanceOptions {
  origin?: Vec2;
  chartWidth?: number;
  chartHeight?: number;
  maxBinNum?: number;
  rectangleCount?: number;
  rectangleWidth?: number;
  rectangleHeight?: number;
  gapBetweenRectangles?: number;
  providers: {
    bins: InstanceProvider<RectangleInstance>;
    rectangles: InstanceProvider<RectangleInstance>;
    lines: InstanceProvider<EdgeInstance>;
    labels: InstanceProvider<LabelInstance>;
  };
}

export class SandDance {
  origin: Vec2 = [10, 800];
  chartWidth: number = 1200;
  chartHeight: number = 600;

  maxBinNum: number = 6;
  binNum: number;
  numOfRecsPerRow: number; // TBD
  binRectangleColor: Vec4 = [0.1, 0.1, 0.1, 1.0];
  binRectangleWidth: number; // will be determined later by calculation
  binRectangleHeight: number = 20;

  rectangleCount: number = 1000;
  rectangleColor: Vec4 = [0, 0, 1, 1];
  rectangleWidth: number = 10;
  rectangleHeight: number = 10;
  gapBetweenRectangles: number = 1;

  keys: string[];
  currentKey: string;

  id: number = 0;

  bins: Bin[];
  persons: Person[] = [];
  rectangles: RectangleInstance[] = [];

  // Maps
  binToRectangles: Map<RectangleInstance, RectangleInstance[]> = new Map();
  idToRectangle: Map<number, RectangleInstance> = new Map();
  binToLocation: Map<Bin, [number, number]> = new Map();

  // Select
  selectedRectangle: RectangleInstance | null = null;
  selectedBin: RectangleInstance | null = null;

  providers: {
    bins: InstanceProvider<RectangleInstance>;
    rectangles: InstanceProvider<RectangleInstance>;
    lines: InstanceProvider<EdgeInstance>;
    labels: InstanceProvider<LabelInstance>;
  };

  constructor(options: ISandDanceOptions) {
    this.origin = options.origin || this.origin;
    this.chartWidth = options.chartWidth || this.chartWidth;
    this.chartHeight = options.chartHeight || this.chartHeight;
    this.maxBinNum = options.maxBinNum || this.maxBinNum;
    this.rectangleCount = options.rectangleCount || this.rectangleCount;
    this.rectangleWidth = options.rectangleWidth || this.rectangleWidth;
    this.rectangleHeight = options.rectangleHeight || this.rectangleHeight;
    this.gapBetweenRectangles =
      options.gapBetweenRectangles || this.gapBetweenRectangles;

    this.providers = options.providers;

    // Generate Persons
    this.generatePersons();
  }

  initGraph() {
    this.providers.labels.clear();
    this.providers.bins.clear();
    this.binToRectangles.clear();
    this.selectedBin = null;
    this.selectedRectangle = null;
    this.bins = [];
  }

  setColorForAllRectangles(color: Vec4) {
    this.rectangles.forEach(rec => {
      rec.color = color;
    });
  }

  generatePersons() {
    const eyeColors = ["blue", "black", "brown", "green"];

    for (let i = 0; i < this.rectangleCount; i++) {
      const person = new Person({
        id: this.id++,
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
        color: this.rectangleColor
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

    this.keys = keys;

    this.sortByKey(keys[0]);
  }

  addPersons(toAdd: number) {
    const eyeColors = ["blue", "black", "brown", "green"];

    // Create new person
    for (let i = 0; i < 0; i++) {
      const person = new Person({
        id: this.id++, // temp
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
        color: [0, 0, 1, 1]
      });

      this.providers.rectangles.add(rec);
      this.rectangles.push(rec);

      this.idToRectangle.set(person.id, rec);

      const key = this.keys[1];

      for (let i = 0; i < this.bins.length; i++) {
        const bin = this.bins[i];
        const binRec = bin.binRectangle;
        if (bin.containsValue(person[key])) {
          const index = this.binToLocation.get(bin);
          const step = this.rectangleWidth + this.gapBetweenRectangles;

          if (index) {
            let rowIndex = index[0] + 1;
            let colIndex = index[1];

            if (rowIndex >= this.numOfRecsPerRow) {
              rowIndex = 0;
              colIndex++;
            }

            rec.position = [
              this.origin[0] + this.binRectangleWidth * i + rowIndex * step,
              this.origin[1] - colIndex * step // + this.gapBetweenRectangles
            ];

            this.binToLocation.set(bin, [rowIndex, colIndex]);
          }

          const list = this.binToRectangles.get(binRec);

          if (list) {
            list.push(rec);
            this.binToRectangles.set(binRec, list);
          }
        }
      }
    }

    for (let i = 0; i < toAdd; i++) {
      const person = new Person({
        id: this.id++, // temp
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
        color: [0, 0, 1, 1]
      });

      this.providers.rectangles.add(rec);
      this.rectangles.push(rec);

      this.idToRectangle.set(person.id, rec);
    }

    this.sortByKey(this.currentKey);
  }

  reducePersons(toRduce: number) {
    for (let i = 0; i < toRduce; i++) {
      const index = Math.floor(Math.random() * this.persons.length);
      const person = this.persons[index];
      this.persons.splice(index, 1);

      const rec = this.idToRectangle.get(person.id);
      if (rec) {
        const indexOfRec = this.rectangles.indexOf(rec);
        this.rectangles.splice(indexOfRec, 1);
        this.providers.rectangles.remove(rec);
      }

      this.idToRectangle.delete(person.id);
    }

    this.sortByKey(this.currentKey);
  }

  moveRectangels() {
    //
  }

  layoutBins() {
    for (let i = 0; i < this.binNum; i++) {
      const binRec = new RectangleInstance({
        depth: 0,
        position: [
          this.origin[0] + this.binRectangleWidth * i,
          this.origin[1] + 20
        ],
        size: [this.binRectangleWidth - 5, this.binRectangleHeight],
        scaling: ScaleMode.ALWAYS,
        color: [0.5, 0.5, 0.5, 1]
      });

      this.providers.bins.add(binRec);

      this.bins[i].binRectangle = binRec;

      this.binToRectangles.set(binRec, []);
    }
  }

  layoutLines() {
    this.providers.lines.add(
      new EdgeInstance({
        start: [this.origin[0], this.origin[1] + 10],
        end: [this.origin[0] + this.chartWidth, this.origin[1] + 10]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        start: [this.origin[0], this.origin[1] + 10],
        end: [this.origin[0], this.origin[1] - this.chartHeight + 10]
      })
    );
  }

  layoutRectangles(key: string) {
    let curIndex = 0;
    let currentBin = this.bins[curIndex];
    let currentX = 0;
    let currentY = 0;

    let rowIndex = 0;
    let colIndex = 0;

    // layout Rectangles
    for (let i = 0; i < this.persons.length; i++) {
      const element = this.persons[i];
      const rec = this.idToRectangle.get(element.id);

      if (rec) {
        const keyValue = element[key];

        while (
          curIndex < this.bins.length &&
          !currentBin.containsValue(keyValue)
        ) {
          curIndex++;
          currentBin = this.bins[curIndex];

          rowIndex = 0;
          colIndex = 0;

          currentX = this.binRectangleWidth * curIndex;
          currentY = 0;
        }

        rec.position = [this.origin[0] + currentX, this.origin[1] - currentY];
        this.binToLocation.set(currentBin, [rowIndex, colIndex]);

        const list = this.binToRectangles.get(currentBin.binRectangle);
        if (list) {
          list.push(rec);
          this.binToRectangles.set(currentBin.binRectangle, list);
        }

        rowIndex++;

        if (rowIndex >= this.numOfRecsPerRow) {
          rowIndex = 0;
          colIndex++;
          currentX = this.binRectangleWidth * curIndex;
          currentY += this.rectangleHeight + this.gapBetweenRectangles;
        } else {
          currentX += this.rectangleWidth + this.gapBetweenRectangles;
        }
      }
    }
  }

  layoutLabels() {
    for (let i = 0; i < this.binNum; i++) {
      const bin = this.bins[i];
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
        origin: [
          this.origin[0] + this.binRectangleWidth * i,
          this.origin[1] + 40
        ],
        fontSize: 24
      });
      this.providers.labels.add(label);
    }
  }

  getBinValues(numberValues: Set<number>, stringValues: Set<string>) {
    // const maxBinNumber = 6;
    let valueNum = 0;
    let binValueType: string = "";

    if (numberValues.size > 0) {
      valueNum = numberValues.size;
      binValueType = "number";
    } else if (stringValues.size > 0) {
      valueNum = stringValues.size;
      binValueType = "string";
    }

    const bins: Bin[] = [];

    if (valueNum > 0 && valueNum <= this.maxBinNum) {
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
          (maxValue + 1 - minValue) / this.maxBinNum
        );
        const rest = maxValue + 1 - minValue - this.maxBinNum * binBasicWidth;
        let start = minValue;

        for (let i = 0; i < this.maxBinNum; i++) {
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
          (maxValue + 1 - minValue) / this.maxBinNum
        );
        const rest = maxValue + 1 - minValue - this.maxBinNum * binBasicWidth;
        let start = minValue;

        for (let i = 0; i < this.maxBinNum; i++) {
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

  sortByKey(key: string) {
    this.currentKey = key;
    this.initGraph();

    const numberValues: Set<number> = new Set<number>();
    const stringValues: Set<string> = new Set<string>();

    for (let i = 0; i < this.persons.length; i++) {
      const element: Person = this.persons[i];
      const value = element[key];

      if (typeof value === "string") {
        stringValues.add(value);
      } else if (typeof value === "number") {
        numberValues.add(value);
      }
    }

    this.bins = this.getBinValues(numberValues, stringValues);
    this.binNum = this.bins.length;

    this.binRectangleWidth = this.chartWidth / this.binNum;
    this.numOfRecsPerRow = Math.floor(
      this.binRectangleWidth / (this.rectangleWidth + this.gapBetweenRectangles)
    );

    // Sorting based on value type
    if (stringValues.size > 0) {
      this.persons.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        return 0;
      });
    }

    if (numberValues.size > 0) {
      this.persons.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        return 0;
      });
    }

    // bins
    this.layoutBins();

    // Rectangles
    this.layoutRectangles(key);

    // lines
    this.layoutLines();

    // labels
    this.layoutLabels();
  }
}
