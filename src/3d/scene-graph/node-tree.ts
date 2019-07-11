import { Node } from './node';

/**
 * This extends the concept of a generic node and sibling structure and forces it into a tree structure by managing the
 * siblings in a manner that has a parent / child like structure.
 */
export class NodeTree<TParent extends NodeTree<any, any, any>, TChild extends NodeTree<any, any, any>, TSibling extends Node<any>> extends Node<TSibling> {
  get parent() { return this._parent; }
  private _parent?: TParent;

  get children() { return this._children; }
  private _children = new Map<number, TChild>();


}
