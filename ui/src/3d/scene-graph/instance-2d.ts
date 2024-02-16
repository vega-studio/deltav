import {
  IInstanceOptions,
  Instance,
  makeObservable,
  observable,
} from "../../instance-provider";
import { Quaternion, Vec2Compat, Vec3 } from "../../math";
import { Transform2D } from "./transform-2d";

export interface IInstance3DOptions extends IInstanceOptions {
  /** The transform object that will manage this instance */
  transform?: Transform2D;
  /** A parent Instance or Transform2D to this instance */
  parent?: Transform2D | Instance2D;
}

/**
 * Basic properties of an instance that exists within a 3D world.
 */
export class Instance2D extends Instance {
  /** Flag indicates local space properties are retrieved from this instance */
  needsLocalUpdate: boolean = false;
  /** Flag indicates world space properties are retrieved from this instance */
  needsWorldUpdate: boolean = false;

  /**
   * This is the 3D transform that will place this object within the 3D world.
   */
  @observable private _transform!: Transform2D;
  get transform() {
    return this._transform;
  }
  set transform(val: Transform2D) {
    if (!this._transform) {
      this._position = val.position;
      this._rotation = val.rotation;
      this._scale = val.scale;
      this._localPosition = val.localPosition;
      this._localRotation = val.localRotation;
      this._localScale = val.localScale;
    }

    val.instance = this;
    this._transform = val;
  }

  /** Local position of the Instance */
  get localPosition() {
    this.needsLocalUpdate = true;
    return this._localPosition;
  }
  set localPosition(val: Vec2Compat) {
    this.transform.localPosition = val;
  }
  @observable private _localPosition!: Vec2Compat;

  /** Local space rotation of the Instance */
  get localRotation() {
    this.needsLocalUpdate = true;
    return this._localRotation;
  }
  set localRotation(val: number) {
    this.transform.localRotation = val;
  }
  @observable private _localRotation!: number;

  /** Local axis scale of the instance */
  get localScale() {
    this.needsLocalUpdate = true;
    return this._localScale;
  }
  set localScale(val: Vec2Compat) {
    this.transform.localScale = val;
  }
  @observable private _localScale!: Vec2Compat;

  /** World position of the Instance */
  get position() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._position;
  }
  @observable private _position!: Vec3;

  /** World space rotation of the Instance */
  get rotation() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._rotation;
  }
  @observable private _rotation!: Quaternion;

  /** Axis scale of the instance */
  get scale() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._scale;
  }
  @observable private _scale!: Vec3;

  /**
   * Quick way to work with parent transforms. This is just syntactic sugar so
   * you don't have to instance.transform.parent all the time.
   */
  set parent(val: Instance2D) {
    this.transform.parent = val.transform;
  }

  constructor(options: IInstance3DOptions) {
    super(options);
    makeObservable(this, Instance2D);
    const transform = options.transform || new Transform2D();
    this.transform = transform;

    if (options.parent) {
      if (options.parent instanceof Instance2D) {
        this.parent = options.parent;
      } else {
        this.transform.parent = options.parent;
      }
    }
  }
}
