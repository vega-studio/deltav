import { identity4, Mat4x4 } from "../../math";
import { Node } from "./node";
import { Transform } from "./transform";

/**
 * Expresses an item in the 3D world within a SceneGraph. Allows the concept of parent child relationships and provides
 * calculated world transforms as the culmination of the relationships.
 */
export class Node3D extends Node<Node3D> {
  /** The transform in local space of this node. If there is no parent, this transform === the world transform */
  get local() {
    return this._local.matrix;
  }
  private _local: Transform = new Transform();

  /** The parent node of this node */
  get parent() {
    return this._parent;
  }
  private _parent: Node3D | null = null;

  /**
   * The world transform matrix computed for this node. This is the transform used to position objects within
   * the world. This returns the local transform if no world transform is computed for this node (ie- this node has
   * no parent).
   */
  get world() {
    if (!this._world) {
      return this._local.matrix;
    }

    return this._world;
  }
  private _world: Mat4x4 | null = identity4();

  willMount(): void {
    throw new Error("Method not implemented.");
  }

  didMount(): void {
    throw new Error("Method not implemented.");
  }
}
