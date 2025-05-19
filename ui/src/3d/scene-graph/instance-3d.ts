import {
  IInstanceOptions,
  Instance,
  makeObservable,
  observable,
} from "../../instance-provider";
import { Mat4x4, Quaternion, Vec3 } from "../../math";
import { Transform } from "./transform.js";

export interface IInstance3DOptions extends IInstanceOptions {
  /** The transform object that will manage this instance */
  transform?: Transform;
  /** A parent Instance or Transform to this instance */
  parent?: Transform | Instance3D;
}

/**
 * Basic properties of an instance that exists within a 3D world.
 */
export class Instance3D extends Instance {
  /** Flag indicates local space properties are retrieved from this instance */
  needsLocalUpdate = false;
  /** Flag indicates world space properties are retrieved from this instance */
  needsWorldUpdate = false;

  /**
   * This is the 3D transform that will place this object within the 3D world.
   */
  get transform() {
    return this._transform;
  }
  set transform(val: Transform) {
    if (!this._transform) {
      this._position = val.position;
      this._rotation = val.rotation;
      this._scale = val.scale;
      this._localPosition = val.localPosition;
      this._localRotation = val.localRotation;
      this._localScale = val.localScale;
      this._matrix = val.matrix;
      this._localMatrix = val.localMatrix;
    }

    val.instance = this;
    this._transform = val;
  }
  private _transform!: Transform;

  /**
   * Matrix representing the transform needed to put this instance into world
   * space. Should never edit this directly. Use the transform property or the
   * orientation properties to mutate this transform.
   */
  get matrix(): Mat4x4 {
    this._transform.update();
    return this._matrix;
  }
  @observable private _matrix!: Mat4x4;

  /**
   * Matrix used to represent the transform this object places on itself.
   * Anything using this matrix as it's basis
   */
  get localMatrix(): Mat4x4 {
    this._transform.update();
    return this._localMatrix;
  }
  @observable private _localMatrix!: Mat4x4;

  /** Local position of the Instance */
  get localPosition() {
    this.needsLocalUpdate = true;
    return this._localPosition;
  }
  set localPosition(val: Vec3) {
    this.transform.localPosition = val;
  }
  @observable private _localPosition!: Vec3;

  /** Local space rotation of the Instance */
  get localRotation() {
    this.needsLocalUpdate = true;
    return this._localRotation;
  }
  set localRotation(val: Quaternion) {
    this.transform.localRotation = val;
  }
  @observable private _localRotation!: Quaternion;

  /** Local axis scale of the instance */
  get localScale() {
    this.needsLocalUpdate = true;
    return this._localScale;
  }
  set localScale(val: Vec3) {
    this.transform.localScale = val;
  }
  @observable private _localScale!: Vec3;

  /** World position of the Instance */
  get position() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._position;
  }
  set position(val: Vec3) {
    this.transform.position = val;
  }
  @observable private _position!: Vec3;

  /** World space rotation of the Instance */
  get rotation() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._rotation;
  }
  set rotation(val: Quaternion) {
    this.transform.rotation = val;
  }
  @observable private _rotation!: Quaternion;

  /** Axis scale of the instance */
  get scale() {
    this.needsWorldUpdate = true;
    this.transform.update();
    return this._scale;
  }
  set scale(val: Vec3) {
    this.transform.scale = val;
  }
  @observable private _scale!: Vec3;

  /**
   * Quick way to work with parent transforms. This is just syntactic sugar so
   * you don't have to instance.transform.parent all the time.
   */
  set parent(val: Instance3D) {
    this.transform.parent = val.transform;
  }

  constructor(options: IInstance3DOptions) {
    super(options);
    makeObservable(this, Instance3D);
    const transform = options.transform || new Transform();
    this.transform = transform;

    if (options.parent) {
      if (options.parent instanceof Instance3D) {
        this.parent = options.parent;
      } else {
        this.transform.parent = options.parent;
      }
    }
  }

  /**
   * This is an ambiguous but simple method that attempts to re-optimize this
   * instance. If you have maybe a one time analysis of an instance over the
   * course of a lengthy period of time, consider calling this.
   *
   * Instances and transforms take the approach of "shifting gears" toward world
   * decomposition after world orientations are queried. However, you may not
   * always need or rarely need a specific world orientation. Thus calling this
   * method will make the instance and transform assume it no longer needs world
   * orientations once again until something queries for it.
   */
  optimize() {
    this.needsWorldUpdate = false;
    this.needsLocalUpdate = false;
    this.transform.optimize();
  }
}
