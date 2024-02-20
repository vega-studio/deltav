/**
 * This is simply a structural model that depicts parent child relationships
 * that forms a strict tree. This model does not allow for circular dependencies
 * within the tree structure.
 *
 * Circular dependencies can be formed (for performance reasons) but queries
 * against the tree will discover those dependencies and properly error at that
 * time.
 *
 * This also facilitates flow down updates. If this node needs an update, then
 * all of it's branches beneath it require an update as well. This also
 * facilitates gated updates to each child, meaning, if this node needs an
 * update, it will retain flags for each child to be updated. This allows us to
 * update this node but not immediately require all children beneath the node to
 * update. This makes updates more opt-in or 'as needed', thus allowing branches
 * to never update if they never need to.
 */
export abstract class TreeNode<T extends TreeNode<any>> {
  /**
   * The parent node of this node.
   */
  public get parent() {
    return this._parent;
  }
  public set parent(parent: T | undefined) {
    this.setParent(parent);
  }
  private _parent?: T;

  /**
   * The children registered with this node. This node will be the "parent"
   * property of all the nodes in this list.
   */
  private _children: T[] = [];
  public get children(): readonly T[] {
    return this._children;
  }

  /** This flag indicates this node itself needs to be updated */
  public get needsUpdate(): boolean {
    return this._needsUpdate;
  }
  private _needsUpdate = false;

  /** This stores which children require updating still */
  private _childUpdate: Set<T> = new Set();
  public get childUpdate(): ReadonlySet<T> {
    return this._childUpdate;
  }

  /**
   * This adds a child to this node. This allows for unsafe adding of the child
   * which will not update the other hierarchy properties.
   */
  addChild(child: T, unsafe?: boolean) {
    // A child can not be doubly registered.
    if (child.parent === this) return;

    // Ensure the child references this node as it's parent now. The unsafe flag
    // indicates we do not need to ensure the parent.
    if (!unsafe) {
      child.setParent(this, true);
    }

    this._children.push(child);
    this._childUpdate.add(child);
    child.invalidate();
  }

  /**
   * This flags this node as invalid and sets all of it's children as needing to
   * be updated as a result. This effectively flags the entrie branch system
   * beneath this node as needing to be updated.
   */
  invalidate() {
    // Only invalidate if this is not invalidated already
    if (this._needsUpdate) return false;
    this._needsUpdate = true;

    // Invalidate all children
    for (let i = 0, iMax = this._children.length; i < iMax; ++i) {
      const child = this._children[i];
      this._childUpdate.add(child);
      child.invalidate();
    }

    return true;
  }

  /**
   * This retrieves and analyzes all of the nodes that are needing an update up
   * the chain from the current node. This resolves each node as it's
   * discovered.
   */
  processParentUpdates(handle: (node: T) => void) {
    // No parent update needed
    if (!this._parent || !this._parent._needsUpdate) return;

    const toProcess = [];
    let next = this._parent;

    while (next) {
      toProcess.push(next);

      if (next._parent && next._parent.needsUpdate) {
        next = next._parent;
      } else {
        break;
      }
    }

    // We now have all the parents up the chain that need updating before this
    // node can be processed. We want to process these nodes from the top most
    // parent downward, our list is built bottom up, so we have to loop it in
    // reverse
    for (let i = toProcess.length - 1; i >= 0; --i) {
      const process = toProcess[i];
      handle(process);
      process.resolve();
    }
  }

  /**
   * Removes the specified child from this node. Only works if the child
   * specifies this node as it's parent. This allows for unsafe removal of the
   * child which will not update the other hierarchy properties.
   */
  removeChild(child: T, unsafe?: boolean) {
    // Only nodes that are registered children of this node can be removed
    if (child._parent !== this) return;

    // Ensure the child has it's parent updated to no parent. The unsafe flag
    // indicates this will be handled elsewhere.
    if (child._parent !== void 0 && !unsafe) {
      child.setParent(undefined, true);
    }

    // Clear the child from our child list
    this._children.splice(this._children.indexOf(child), 1);
    this._childUpdate.delete(child);
  }

  /**
   * Clears update flags that are set from invalidation. This clears the nodes
   * personal flag as well as the gate flag the parent contains for the node as
   * well.
   */
  resolve() {
    if (!this._needsUpdate) return;
    this._needsUpdate = false;

    if (this._parent) {
      this._parent._childUpdate.delete(this);
    }
  }

  /**
   * Sets the parent of this node to the specified node. This is the same in
   * most cases to node.parent = aNode; but this method allows for unsafe
   * modification to the parent.
   */
  setParent(parent?: T, unsafe?: boolean) {
    if (this._parent === parent) return;

    if (!unsafe) {
      // Add this as a child to the new parent
      if (parent !== void 0) {
        parent.addChild(this, true);
      }

      // Remove this from the old parent's child list
      if (this._parent) {
        this._parent.removeChild(this, true);
      }
    }

    this._parent = parent;
    this.invalidate();
  }
}
