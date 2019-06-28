import {
  EasingUtil,
  EdgeInstance,
  InstanceProvider,
  LabelInstance,
  nextFrame,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  Vec2,
  Vec4
} from "src";
import { Bucket, BucketType, BucketValueType } from "./bucket";
import { Person } from "./person";

export interface ISandDanceOptions {
  /** Sets the origin point of the chart */
  origin?: Vec2;
  /** Sets the width of the chart */
  chartWidth?: number;
  /** Sets the height of the chart */
  chartHeight?: number;
  /** Sets the max number of buckets */
  maxBucketNum?: number;
  /** Sets the number of rectangles */
  rectangleCount?: number;
  /** Sets the width of single rectangle */
  rectangleWidth?: number;
  /** Sets the height of single rectangle */
  rectangleHeight?: number;
  /** Sets the gap between rectangles in chart */
  gapBetweenRectangles?: number;
  /** Provides for shapes in chart */
  providers: {
    buckets: InstanceProvider<RectangleInstance>;
    rectangles: InstanceProvider<RectangleInstance>;
    lines: InstanceProvider<EdgeInstance>;
    labels: InstanceProvider<LabelInstance>;
  };
  /** Sets the number of elements to add at a time */
  addAtOnce?: number;
  /** Sets the number of elements to move at a time */
  moveAtOnce?: number;
}

export class SandDance {
  /** Origin point of chart */
  origin: Vec2 = [10, 800];
  /** Width of chart */
  chartWidth: number = 1200;
  /** Height of chart */
  chartHeight: number = 600;
  /** Number of elements to add at once */
  addAtOnce: number = 30;
  /** Number of elements to move at once */
  moveAtOnce: number = 30;
  /** Max number of buckets */
  maxBucketNum: number = 6;
  /** Actuall number of bucket, will be determined by number of values */
  bucketNum: number;
  /** Color of rectangles that represent buckets */
  bucketRectangleColor: Vec4 = [0, 0, 0, 1.0];
  /** Width of buckets' rectangles , will be determined by bucketNum and chartWidth */
  bucketRectangleWidth: number;
  /** Height of buckets' rectangles */
  bucketRectangleHeight: number = 10;
  /** Number of rectangles in a row, will be determined by bucketRectangleWidtha and rectangelWidth */
  numOfRecsPerRow: number;
  /** Number of rectangles */
  rectangleCount: number = 1000;
  /** Color of rectangle */
  rectangleColor: Vec4 = [0, 0, 1, 1];
  /** Width of rectangles */
  rectangleWidth: number = 10;
  /** Height of rectangles */
  rectangleHeight: number = 10;
  /** Gap between rectangles in horizon and vertical direction */
  gapBetweenRectangles: number = 1;

  // Arrays
  buckets: Bucket[];
  persons: Person[] = [];
  rectangles: RectangleInstance[] = [];

  /** Keys used to sorts all the elements */
  private _keys: string[];
  /** Key in use currently */
  private currentKey: string;
  /** Used to generate id for new elements */
  private id: number = 0;

  // Maps
  /** Records rectangles that belong to each bucket */
  bucketToRectangles: Map<RectangleInstance, RectangleInstance[]> = new Map();
  /** Maps from person's id to rectangle that represents that person */
  idToRectangle: Map<number, RectangleInstance> = new Map();
  /** Records the current location of each bucket which is used to put next possible rectangle */
  bucketToLocation: Map<Bucket, [number, number]> = new Map();

  // Providers
  providers: {
    buckets: InstanceProvider<RectangleInstance>;
    rectangles: InstanceProvider<RectangleInstance>;
    lines: InstanceProvider<EdgeInstance>;
    labels: InstanceProvider<LabelInstance>;
  };

  constructor(options: ISandDanceOptions) {
    this.origin = options.origin || this.origin;
    this.chartWidth = options.chartWidth || this.chartWidth;
    this.chartHeight = options.chartHeight || this.chartHeight;
    this.maxBucketNum = options.maxBucketNum || this.maxBucketNum;
    this.rectangleCount = options.rectangleCount || this.rectangleCount;
    this.rectangleWidth = options.rectangleWidth || this.rectangleWidth;
    this.rectangleHeight = options.rectangleHeight || this.rectangleHeight;
    this.gapBetweenRectangles =
      options.gapBetweenRectangles || this.gapBetweenRectangles;
    this.addAtOnce = options.addAtOnce || this.addAtOnce;
    this.moveAtOnce = options.moveAtOnce || this.moveAtOnce;

    this.providers = options.providers;

    // Generate Persons
    this.generatePersons();
  }

  get keys() {
    return this._keys;
  }

  /** Init graph for sorting*/
  initGraph() {
    this.providers.labels.clear();
    this.providers.buckets.clear();
    this.providers.lines.clear();
    this.bucketToRectangles.clear();
    this.buckets = [];
  }

  /** Set color for all rectangles */
  async setColorForAllRectangles(color: Vec4) {
    let index = 0;

    while (index < this.rectangles.length) {
      const toChange = [];

      for (let i = 0; i < 50 && index < this.rectangles.length; ++index, ++i) {
        const rec = this.rectangles[index];
        rec.color = color;
        toChange.push(rec);
      }

      EasingUtil.all(
        false,
        toChange,
        [RectangleLayer.attributeNames.color],
        easing => {
          easing.setTiming(11);
        }
      );

      await nextFrame();
    }
  }

  /** Highlight single rectangle and dim the others */
  async highLightSingleRectangle(
    dimColor: Vec4,
    highLightInstance: RectangleInstance,
    highlightColor: Vec4
  ) {
    highLightInstance.color = highlightColor;

    let index = 0;

    while (index < this.rectangles.length) {
      const toChange = [];

      for (let i = 0; i < 30 && index < this.rectangles.length; ++index, ++i) {
        const rec = this.rectangles[index];
        if (rec !== highLightInstance) rec.color = dimColor;
        toChange.push(rec);
      }

      EasingUtil.all(
        false,
        toChange,
        [RectangleLayer.attributeNames.color],
        easing => {
          easing.setTiming(11);
        }
      );

      await nextFrame();
    }
  }

  /** Hightlight all rectangles in a bucket and dim the others */
  async highLightRectangles(
    dimColor: Vec4,
    rectangles: RectangleInstance[],
    highLightColor: Vec4
  ) {
    const tempSet: Set<RectangleInstance> = new Set();
    rectangles.forEach(rec => {
      rec.color = highLightColor;
      tempSet.add(rec);
    });

    let index = 0;

    while (index < this.rectangles.length) {
      const toChange = [];

      for (let i = 0; i < 50 && index < this.rectangles.length; ++index, ++i) {
        const rec = this.rectangles[index];
        if (!tempSet.has(rec)) rec.color = dimColor;
        toChange.push(rec);
      }

      EasingUtil.all(
        false,
        toChange,
        [RectangleLayer.attributeNames.color],
        easing => {
          easing.setTiming(1000 * Math.random());
        }
      );

      await nextFrame();
    }
  }

  /** Generate each person , related rectangle and get keys for sorting*/
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

    this._keys = keys;
    this.sortByKey(keys[0]);
  }

  /** Add persons */
  async addPersons(toAdd: number) {
    const eyeColors = ["blue", "black", "brown", "green"];

    let index = 0;
    while (index < toAdd) {
      for (let i = 0; i < this.addAtOnce && index < toAdd; ++index, ++i) {
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

      await nextFrame();
    }

    this.sortByKey(this.currentKey);
  }

  /** Reduce persons */
  async reducePersons(toRduce: number) {
    let length = this.persons.length;

    const personToReduce = [];

    for (let i = 0; i < toRduce; i++) {
      const randomIndex = Math.floor(Math.random() * length);

      // Swap the person with the last person
      const person = this.persons[randomIndex];
      this.persons[randomIndex] = this.persons[length - 1];
      this.persons[length - 1] = person;

      personToReduce.push(person);

      length--;

      const rec = this.idToRectangle.get(person.id);
      if (rec) {
        rec.color = [0, 0, 0, 0];
      }
    }

    await nextFrame();

    let index = 0;
    while (index < toRduce) {
      const recsToRemove = [];
      for (let i = 0; i < this.addAtOnce && index < toRduce; ++index, ++i) {
        const person = personToReduce[index];
        this.persons.pop();

        if (person) {
          const rec = this.idToRectangle.get(person.id);

          if (rec) {
            recsToRemove.push(rec);
            const indexOfRec = this.rectangles.indexOf(rec);
            this.rectangles.splice(indexOfRec, 1);
            this.providers.rectangles.remove(rec);
          }
          this.idToRectangle.delete(person.id);
        }
      }
    }

    this.sortByKey(this.currentKey);
  }

  /** Layout the buckets' rectangles */
  layoutBuckets() {
    for (let i = 0; i < this.bucketNum; i++) {
      const bucketRec = new RectangleInstance({
        depth: 0,
        position: [
          this.origin[0] + this.bucketRectangleWidth * i,
          this.origin[1] + this.rectangleHeight + 2
        ],
        size: [this.bucketRectangleWidth, this.bucketRectangleHeight],
        scaling: ScaleMode.ALWAYS,
        color: this.bucketRectangleColor
      });

      this.providers.buckets.add(bucketRec);

      this.buckets[i].bucketRectangle = bucketRec;

      this.bucketToRectangles.set(bucketRec, []);
    }
  }

  /** Layout the lines for chart */
  layoutLines() {
    this.providers.lines.add(
      new EdgeInstance({
        startColor: [0.3, 0.3, 0.3, 1.0],
        endColor: [0.3, 0.3, 0.3, 1.0],
        start: [this.origin[0], this.origin[1] + this.rectangleHeight + 2],
        end: [
          this.origin[0] + this.chartWidth,
          this.origin[1] + this.rectangleHeight + 2
        ],
        thickness: [1, 1]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        startColor: [0.3, 0.3, 0.3, 1.0],
        endColor: [0.3, 0.3, 0.3, 1.0],
        start: [
          this.origin[0],
          this.origin[1] + this.rectangleHeight + this.bucketRectangleHeight + 2
        ],
        end: [
          this.origin[0] + this.chartWidth,
          this.origin[1] + this.rectangleHeight + this.bucketRectangleHeight + 2
        ],
        thickness: [1, 1]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        startColor: [0.3, 0.3, 0.3, 1.0],
        endColor: [0.3, 0.3, 0.3, 1.0],
        start: [this.origin[0], this.origin[1] + this.rectangleHeight + 2],
        end: [this.origin[0], this.origin[1] - this.chartHeight + 10]
      })
    );

    for (let i = 0; i <= this.bucketNum; i++) {
      this.providers.lines.add(
        new EdgeInstance({
          startColor: [0.3, 0.3, 0.3, 1.0],
          endColor: [0.3, 0.3, 0.3, 1.0],
          start: [
            this.origin[0] + this.bucketRectangleWidth * i,
            this.origin[1] + this.rectangleHeight + 2
          ],
          end: [
            this.origin[0] + this.bucketRectangleWidth * i,
            this.origin[1] +
              this.rectangleHeight +
              this.bucketRectangleHeight +
              2
          ],
          thickness: [1, 1]
        })
      );
    }
  }

  /** Layout all the rectangles */
  async layoutRectangles(key: string) {
    let curIndex = 0;
    let currentBucket = this.buckets[curIndex];
    let currentX = 0;
    let currentY = 0;
    let rowIndex = 0;
    let colIndex = 0;

    let index = 0;
    while (index < this.persons.length) {
      await nextFrame();
      const toMove: RectangleInstance[] = [];
      for (
        let i = 0;
        i < this.moveAtOnce && index < this.persons.length;
        ++i, ++index
      ) {
        const element = this.persons[index];
        const rec = this.idToRectangle.get(element.id);

        if (rec) {
          toMove.push(rec);

          const keyValue = element[key];

          while (
            curIndex < this.buckets.length &&
            !currentBucket.containsValue(keyValue)
          ) {
            curIndex++;
            currentBucket = this.buckets[curIndex];
            rowIndex = 0;
            colIndex = 0;
            currentX = this.bucketRectangleWidth * curIndex;
            currentY = 0;
          }

          rec.position = [this.origin[0] + currentX, this.origin[1] - currentY];
          this.bucketToLocation.set(currentBucket, [rowIndex, colIndex]);

          const list = this.bucketToRectangles.get(
            currentBucket.bucketRectangle
          );
          if (list) {
            list.push(rec);
            this.bucketToRectangles.set(currentBucket.bucketRectangle, list);
          }

          rowIndex++;

          if (rowIndex >= this.numOfRecsPerRow) {
            rowIndex = 0;
            colIndex++;
            currentX = this.bucketRectangleWidth * curIndex;
            currentY += this.rectangleHeight + this.gapBetweenRectangles;
          } else {
            currentX += this.rectangleWidth + this.gapBetweenRectangles;
          }
        }
      }

      EasingUtil.all(
        false,
        toMove,
        [RectangleLayer.attributeNames.location],
        easing => {
          easing.setTiming(200 * Math.random());
        }
      );
    }
  }

  /** Layout all the labels that represent buckets */
  layoutLabels() {
    for (let i = 0; i <= this.bucketNum; i++) {
      const bucket = i < this.bucketNum ? this.buckets[i] : this.buckets[i - 1];
      let labelText = "";

      if (bucket.type === BucketType.SINGLE && i < this.bucketNum) {
        labelText = bucket.value.toString();
        const label = new LabelInstance({
          text: labelText,
          color: [0.6, 0.6, 0.6, 1],
          origin: [
            this.origin[0] +
              this.bucketRectangleWidth * i +
              this.bucketRectangleWidth / 2,
            this.origin[1] +
              this.bucketRectangleHeight +
              this.rectangleHeight +
              6
          ],
          fontSize: 12
        });
        this.providers.labels.add(label);
      } else {
        if (typeof bucket.value === "object") {
          labelText =
            i < this.bucketNum ? `${bucket.value[0]}` : `${bucket.value[1]}`; // - ${bucket.value[1]}`;
        }
        const label = new LabelInstance({
          text: labelText,
          color: [0.6, 0.6, 0.6, 1],
          origin: [
            this.origin[0] + this.bucketRectangleWidth * i,
            this.origin[1] +
              this.bucketRectangleHeight +
              this.rectangleHeight +
              6
          ],
          fontSize: 12
        });
        this.providers.labels.add(label);
      }
    }
  }

  /** Take all the values of elements to generate buckets'value */
  getBucketValues(numberValues: Set<number>, stringValues: Set<string>) {
    let valueNum = 0;
    let bucketValueType: string = "";

    if (numberValues.size > 0) {
      valueNum = numberValues.size;
      bucketValueType = "number";
    } else if (stringValues.size > 0) {
      valueNum = stringValues.size;
      bucketValueType = "string";
    }

    const buckets: Bucket[] = [];

    if (valueNum > 0 && valueNum <= this.maxBucketNum) {
      if (bucketValueType === "number") {
        const valueArray = Array.from(numberValues);
        valueArray.sort((a, b) => a - b);

        for (let i = 0; i < valueArray.length; i++) {
          const value = valueArray[i];
          buckets.push(
            new Bucket({
              type: BucketType.SINGLE,
              valueType: BucketValueType.NUMBER,
              value
            })
          );
        }
      } else if (bucketValueType === "string") {
        const valueArray = Array.from(stringValues);
        valueArray.sort((a, b) => a.localeCompare(b));

        for (let i = 0; i < valueArray.length; i++) {
          const value = valueArray[i];
          buckets.push(
            new Bucket({
              type: BucketType.SINGLE,
              valueType: BucketValueType.STRING,
              value
            })
          );
        }
      }
    } else {
      if (bucketValueType === "number") {
        const valueArray = Array.from(numberValues);
        let minValue = valueArray[0];
        let maxValue = valueArray[0];

        numberValues.forEach(value => {
          if (value > maxValue) maxValue = value;
          if (value < minValue) minValue = value;
        });

        const bucketBasicWidth = Math.floor(
          (maxValue + 1 - minValue) / this.maxBucketNum
        );
        const rest =
          maxValue + 1 - minValue - this.maxBucketNum * bucketBasicWidth;
        let start = minValue;

        for (let i = 0; i < this.maxBucketNum; i++) {
          let bucketWidth = bucketBasicWidth;
          if (i < rest) bucketWidth++;
          buckets.push(
            new Bucket({
              type: BucketType.RANGE,
              valueType: BucketValueType.NUMBER,
              value: [start, start + bucketWidth - 1]
            })
          );
          start += bucketWidth;
        }
      } else if (bucketValueType === "string") {
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

        const bucketBasicWidth = Math.floor(
          (maxValue + 1 - minValue) / this.maxBucketNum
        );
        const rest =
          maxValue + 1 - minValue - this.maxBucketNum * bucketBasicWidth;
        let start = minValue;

        for (let i = 0; i < this.maxBucketNum; i++) {
          let bucketWidth = bucketBasicWidth;
          if (i < rest) bucketWidth++;

          buckets.push(
            new Bucket({
              type: BucketType.RANGE,
              valueType: BucketValueType.STRING,
              value: [
                String.fromCharCode(start),
                String.fromCharCode(start + bucketWidth - 1)
              ]
            })
          );
          start += bucketWidth;
        }
      }
    }

    return buckets;
  }

  /** Sort all the elements based on key */
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

    this.buckets = this.getBucketValues(numberValues, stringValues);
    this.bucketNum = this.buckets.length;
    this.bucketRectangleWidth = this.chartWidth / this.bucketNum;
    this.numOfRecsPerRow = Math.floor(
      this.bucketRectangleWidth /
        (this.rectangleWidth + this.gapBetweenRectangles)
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

    // buckets
    this.layoutBuckets();

    // Rectangles
    this.layoutRectangles(key);

    // lines
    this.layoutLines();

    // labels
    this.layoutLabels();
  }
}
