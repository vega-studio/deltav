import { identity4, Mat4x4 } from "../../math";
import { Transform } from "./transform";

/**
 * Expresses an item in the 3D world within a SceneGraph. Allows the concept of parent child relationships and provides
 * calculated world transforms as the culmination of the relationships.
 */
export class Node3D {
  /** This is a flag to allow manual control over the visibility of the node and NOT it's children */
  localVisible: boolean = true;
  /** This is a flag to allow manual control over the visibility of the node's children */
  branchVisible: boolean = true;
  /**
   * This is a flag controlled by the Scene Graph that is used to let the graph determine if the node should be visible
   * or not. THings like the graph's internal octree or other strategies will control this visibility setting.
   */
  visibleInGraph: boolean = true;

  /** The transform in local space of this node. If there is no parent, this transform === the world transform */
  get local() {
    return this._local;
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

  /**
   * Lifecycle: This executes before updates are applied / required of this node in the scene graph
   */
  willUpdate() {
    /** No-op as the default behavior */
  }

  /**
   * Lifecycle: This executes after updates are applied to this node.
   */
  didUpdate() {
    /** No-op as the default behavior */
  }
}
