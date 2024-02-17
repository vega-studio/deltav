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
export declare abstract class TreeNode<T extends TreeNode<any>> {
    /**
     * The parent node of this node.
     */
    get parent(): T | undefined;
    set parent(parent: T | undefined);
    private _parent?;
    /**
     * The children registered with this node. This node will be the "parent"
     * property of all the nodes in this list.
     */
    private _children;
    get children(): readonly T[];
    /** This flag indicates this node itself needs to be updated */
    get needsUpdate(): boolean;
    private _needsUpdate;
    /** This stores which children require updating still */
    private _childUpdate;
    get childUpdate(): ReadonlySet<T>;
    /**
     * This adds a child to this node. This allows for unsafe adding of the child
     * which will not update the other hierarchy properties.
     */
    addChild(child: T, unsafe?: boolean): void;
    /**
     * This flags this node as invalid and sets all of it's children as needing to
     * be updated as a result. This effectively flags the entrie branch system
     * beneath this node as needing to be updated.
     */
    invalidate(): boolean;
    /**
     * This retrieves and analyzes all of the nodes that are needing an update up
     * the chain from the current node. This resolves each node as it's
     * discovered.
     */
    processParentUpdates(handle: (node: T) => void): void;
    /**
     * Removes the specified child from this node. Only works if the child
     * specifies this node as it's parent. This allows for unsafe removal of the
     * child which will not update the other hierarchy properties.
     */
    removeChild(child: T, unsafe?: boolean): void;
    /**
     * Clears update flags that are set from invalidation. This clears the nodes
     * personal flag as well as the gate flag the parent contains for the node as
     * well.
     */
    resolve(): void;
    /**
     * Sets the parent of this node to the specified node. This is the same in
     * most cases to node.parent = aNode; but this method allows for unsafe
     * modification to the parent.
     */
    setParent(parent?: T, unsafe?: boolean): void;
}
