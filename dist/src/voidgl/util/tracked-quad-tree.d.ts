import { Instance } from '../instance-provider/instance';
import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';
export declare type BoundsAccessor<T extends Instance> = (o: T) => Bounds | null;
/**
 * Allows typing of a callback argument
 */
export interface IVisitFunction<T extends Instance> {
    /**
     * A callback to use during add or query
     *
     * Called do provide aggregation or filtering like Array.reduce or
     * Array.filter, but in a QuadTree instead.
     *
     * @param node  The node to effect the function upon
     * @param child The child to add to the node
     */
    (node: Node<T>, child?: Bounds): void;
}
/**
 * This is a class used specifically by the quad tree nodes to indicate split space
 * within the quad tree.
 */
export declare class Quadrants<T extends Instance> {
    TL: Node<T>;
    TR: Node<T>;
    BL: Node<T>;
    BR: Node<T>;
    /**
     * Ensures all memory is released for all nodes and all references are removed
     * to potentially high memory consumption items
     */
    destroy(): void;
    /**
     * Creates an instance of Quadrants.
     *
     * @param bounds The bounds this will create quandrants for
     * @param depth  The child depth of this element
     */
    constructor(bounds: Bounds, depth: number, getBounds: BoundsAccessor<T>, childToNode: Map<T, Node<T>>, childToBounds: Map<T, Bounds | null>);
}
/**
 * The quad tree node. This Node will take in a certain population before dividing itself into
 * 4 quadrants which it will attempt to inject it's population into. If a member of the population
 * does not completely get injected into one of the quadrants it remains as a member of this node.
 */
export declare class Node<T extends Instance> {
    /** This is the amount of space this node covers */
    bounds: Bounds;
    /** These are the child Instances of the node. */
    children: T[];
    /**
     * This tracks a quick lookup of a child to it's parent node. This is used so the child can
     * be removed with ease and not require a traversal of the tree.
     */
    childToNode: Map<T, Node<T>>;
    /** This tracks the bounds calcuated for the given instance */
    childToBounds: Map<T, Bounds | null>;
    /** This is how deep the node is within the tree */
    depth: number;
    /** This is the accessor method that retrieves the bounds for an injected instance */
    getBounds: BoundsAccessor<T>;
    /** These are the child nodes of this quad node when this node is split. It is null if the node is not split yet */
    nodes: Quadrants<T> | null;
    /**
     * These are children with null bounds that do not affect the splitting and ALWAYS get checked every query.
     * They should only reside on the top node.
     */
    nullBounded: T[];
    /**
     * Destroys this node and ensures all child nodes are destroyed as well.
     */
    destroy(): void;
    /**
     * Creates an instance of Node.
     */
    constructor(left: number, right: number, top: number, bottom: number, getBounds: BoundsAccessor<T>, depth?: number);
    /**
     * Adds an object that extends Bounds (or is Bounds) and properly injects it into this node
     * or into a sub quadrant if this node is split already. If the child is outside the boundaries
     * this quad tree spans (and this is the root node), the quad tree will expand to include
     * the new child.
     *
     * @param child The Bounds type object to inject
     * @param props Properties that can be retrieved with the child object if applicable
     *
     * @returns True if the insertion was successful
     */
    add(child: T): boolean;
    /**
     * Adds a list of new children to this quad tree. It performs the same operations as
     * addChild for each child in the list, however, it more efficiently recalculates the
     * bounds necessary to cover the area the children cover.
     *
     * @param children      List of Bounds objects to inject
     */
    addAll(children: T[]): void;
    /**
     * Ensures this quad tree includes the bounds specified in it's spatial coverage.
     * This will cause all children to be re-injected into the tree.
     *
     * @param bounds The bounds to include in the tree's coverage
     */
    cover(bounds: Bounds): void;
    /**
     * When adding children, this performs the actual action of injecting the child into the tree
     * without the process of seeing if the tree needs a spatial adjustment to account for the child.
     *
     * @param child The Bounds item to inject into the tree
     * @param props The props to remain associated with the child
     *
     * @returns True if the injection was successful
     */
    private doAdd(child, bounds, fromSplit?);
    private doRemove(child);
    /**
     * Collects all children of all the current and sub nodes into a single list.
     *
     * @param list The list we must aggregate children into
     *
     * @return The list specified as the list parameter
     */
    gatherChildren(list: T[]): T[];
    /**
     * Entry query for determining query type based on input object
     *
     * @param bounds Can be a Bounds or a Point object
     * @param visit  A callback function that will receive the Node as it is analyzed. This gives
     *               information on a spatial scale, how a query reaches it's target intersections.
     *
     * @return An array of children that intersects with the query
     */
    query(bounds: Bounds | IPoint, visit?: IVisitFunction<T>): T[];
    /**
     * Queries children for intersection with a bounds object
     *
     * @param b     The Bounds to test children against
     * @param list  The list of children to aggregate into the query
     * @param visit A callback function that will receive the Node as it is analyzed. This gives
     *              information on a spatial scale, how a query reaches it's target intersections.
     *
     * @return     Returns the exact same list that was input as the list param
     */
    queryBounds(b: Bounds, list: T[], visit?: IVisitFunction<T>): T[];
    /**
     * Queries children for intersection with a point
     *
     * @param p     The Point to test children against
     * @param list  The list of children to aggregate into the query
     * @param visit A callback function that will receive the Node as it is analyzed. This gives
     *              information on a spatial scale, how a query reaches it's target intersections.
     *
     * @return      Returns the exact same list that was input as the list param
     */
    queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[];
    /**
     * Remove the provided item from the tree.
     */
    remove(child: T): void;
    /**
     * Creates four sub quadrants for this node.
     */
    split(): void;
    /**
     * Traverses the quad tree returning every quadrant encountered
     *
     * @param cb A callback that has the parameter (node) which is a quadrant in the tree
     */
    visit(cb: IVisitFunction<T>): void;
}
export declare class TrackedQuadTree<T extends Instance> extends Node<T> {
}
