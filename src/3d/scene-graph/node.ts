import { uid } from "../../util";

/**
 * This is the most basic node that will be within a Scene Graph. This is simply a container that makes an element
 * compatible with the SceneGraph. Specific types of nodes can extend this node to be injected in the Graph to take
 * advantage of the Graph's basic capabilities.
 */
export abstract class Node<TSibling extends Node<any>> {
  /** Unique numerical identifier to make identification of this object easier */
  get uid() { return this._uid; }
  private _uid = uid();
  /** These are the siblings related to this specified node */
  get siblings(): ReadonlyMap<number, TSibling> { return this._siblings; }
  private _siblings = new Map<number, TSibling>();

  /**
   * This adds a child node to this node's list of children
   */
  addSibling(sibling: TSibling, stopRecurse?: boolean) {
    this._siblings.set(sibling.uid, sibling);

    if (!stopRecurse && !sibling.siblings.has(this.uid)) {
      sibling.addSibling(this, true);
    }
  }

  /**
   * Adds a list of siblings to this node
   */
  addSiblings(siblings: TSibling[]) {
    for (let i = 0, iMax = siblings.length; i < iMax; ++i) {
      const sibling = siblings[i];
      this._siblings.set(sibling.uid, sibling);

      if (!sibling.siblings.has(this.uid)) {
        sibling.addSibling(this, true);
      }
    }
  }

  /**
   * Removes this node from all siblings.
   */
  remove() {
    this._siblings.forEach(sibling => {
      sibling.removeSibling(this);
    });

    this._siblings.clear();
  }

  /**
   * Removes a sibling from this node if it exists as a sibling.
   */
  removeSibling(sibling: TSibling, stopRecurse?: boolean) {
    if (this._siblings.delete(sibling.uid) && !stopRecurse) {
      sibling.removeSibling(this, true);
    }
  }

  /**
   * Generic trigger method
   */
  trigger() {

  }

  /**
   * Lifecycle: Executes when the node is about to be mounted into
   */
  abstract willMount(): void;

  abstract didMount(): void;
}
