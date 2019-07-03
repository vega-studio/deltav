import { Node3D } from "./node-3d";

export class SceneGraph {
  get root() { return this._root; }
  private _root: Node3D;

  /**
   * Sets the root node this scene graph will utilize
   */
  setRoot(node: Node3D) {
    this._root = node;
  }
}
