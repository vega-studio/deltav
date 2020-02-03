/**
 * This is the most basic node that will be within a Scene Graph. This is simply a container that makes an element
 * compatible with the SceneGraph. Specific types of nodes can extend this node to be injected in the Graph to take
 * advantage of the Graph's basic capabilities.
 */
export declare abstract class Node<TSibling extends Node<any>> {
    /** Unique numerical identifier to make identification of this object easier */
    readonly uid: number;
    private _uid;
    /** These are the siblings related to this specified node */
    readonly siblings: ReadonlyMap<number, TSibling>;
    private _siblings;
    /**
     * This adds a child node to this node's list of children
     */
    addSibling(sibling: TSibling, stopRecurse?: boolean): void;
    /**
     * Adds a list of siblings to this node
     */
    addSiblings(siblings: TSibling[]): void;
    /**
     * Removes this node from all siblings.
     */
    remove(): void;
    /**
     * Removes a sibling from this node if it exists as a sibling.
     */
    removeSibling(sibling: TSibling, stopRecurse?: boolean): void;
    /**
     * Generic trigger method
     */
    trigger(): void;
    /**
     * Lifecycle: Executes when the node is about to be mounted into
     */
    abstract willMount(): void;
    abstract didMount(): void;
}
