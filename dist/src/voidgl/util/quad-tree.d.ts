import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';
export interface IQuadItem {
    area: number;
    bottom: number;
    height: number;
    left: number;
    mid: IPoint;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
    containsPoint(point: IPoint): boolean;
    encapsulate(item: IQuadItem): boolean;
    fits(item: IQuadItem): 0 | 1 | 2;
    hitBounds(item: IQuadItem): boolean;
    isInside(item: IQuadItem): boolean;
}
/**
 * This filters a quad tree query by type
 *
 * @export
 * @template T
 */
export declare function filterQuery<T extends IQuadItem>(type: Function[], queryValues: IQuadItem[]): T[];
/**
 * Allows typing of a callback argument
 */
export interface IVisitFunction<T extends IQuadItem> {
    /**
     * A callback to use during add or query
     *
     * Called do provide aggregation or filtering like Array.reduce or
     * Array.filter, but in a QuadTree instead.
     *
     * @param node  The node to effect the function upon
     * @param child The child to add to the node
     */
    (node: Node<T>, child?: IQuadItem): void;
}
/**
 * This is a class used specifically by the quad tree nodes to indicate split space
 * within the quad tree.
 *
 * @class Quadrants
 */
export declare class Quadrants<T extends IQuadItem> {
    TL: Node<T>;
    TR: Node<T>;
    BL: Node<T>;
    BR: Node<T>;
    /**
     * Ensures all memory is released for all nodes and all references are removed
     * to potentially high memory consumption items
     *
     * @memberOf Quadrants
     */
    destroy(): void;
    /**
     * Creates an instance of Quadrants.
     *
     * @param bounds The bounds this will create quandrants for
     * @param depth  The child depth of this element
     *
     * @memberOf Quadrants
     */
    constructor(bounds: IQuadItem, depth: number);
}
/**
 * The quad tree node. This Node will take in a certain population before dividing itself into
 * 4 quadrants which it will attempt to inject it's population into. If a member of the population
 * does not completely get injected into one of the quadrants it remains as a member of this node.
 *
 * @export
 * @class Node
 */
export declare class Node<T extends IQuadItem> {
    bounds: Bounds;
    children: T[];
    depth: number;
    nodes: Quadrants<T>;
    /**
     * Destroys this node and ensures all child nodes are destroyed as well.
     *
     * @memberOf Node
     */
    destroy(): void;
    /**
     * Creates an instance of Node.
     *
     * @param l     The bounding left wall of the space this node covers
     * @param r     The bounding right wall of the space this node covers
     * @param t     The bounding top wall of the space this node covers
     * @param b     The bounding bottom wall of the space this node covers
     * @param depth The depth within the quad tree this node resides
     *
     * @memberOf Node
     */
    constructor(left: number, right: number, top: number, bottom: number, depth?: number);
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
     *
     * @memberOf Node
     */
    add(child: T, props: any): boolean;
    /**
     * Adds a list of new children to this quad tree. It performs the same operations as
     * addChild for each child in the list, however, it more efficiently recalculates the
     * bounds necessary to cover the area the children cover.
     *
     * @param children      List of Bounds objects to inject
     * @param childrenProps List of props to associate with each element
     *
     * @memberOf Node
     */
    addAll(children: T[], childrenProps?: any[]): void;
    /**
     * Ensures this quad tree includes the bounds specified in it's spatial coverage.
     * This will cause all children to be re-injected into the tree.
     *
     * @param bounds The bounds to include in the tree's coverage
     *
     * @memberOf Node
     */
    cover(bounds: IQuadItem): void;
    /**
     * When adding children, this performs the actual action of injecting the child into the tree
     * without the process of seeing if the tree needs a spatial adjustment to account for the child.
     *
     * @param child The Bounds item to inject into the tree
     * @param props The props to remain associated with the child
     *
     * @returns True if the injection was successful
     *
     * @memberOf Node
     */
    doAdd(child: T): boolean;
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
    query(bounds: IQuadItem | IPoint, visit?: IVisitFunction<T>): T[];
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
    queryBounds(b: IQuadItem, list: T[], visit?: IVisitFunction<T>): T[];
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
export declare class QuadTree<T extends IQuadItem> extends Node<T> {
}
