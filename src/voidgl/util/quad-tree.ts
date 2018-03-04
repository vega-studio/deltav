import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';

// A configuration that controls how readily a quadtree will split to another level
// Adjusting this number can improve or degrade your performance significantly and
// Must be tested for specific use cases
const maxPopulation: number = 5;
const maxDepth: number = 10;

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
  hitBounds(item: IQuadItem): boolean;
  isInside(item: IQuadItem): boolean;
}

/**
 * This filters a quad tree query by type
 *
 * @export
 * @template T
 */
export function filterQuery<T extends IQuadItem>(type: Function[], queryValues: IQuadItem[]): T[] {
  const filtered: T[] = [];

  queryValues.forEach((obj: IQuadItem) => {
    if (type.find(t => obj instanceof t)) {
      filtered.push(obj as T);
    }
  });

  return filtered;
}

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
  (node : Node<T>, child? : IQuadItem) : void
}

/**
 * This is a class used specifically by the quad tree nodes to indicate split space
 * within the quad tree.
 *
 * @class Quadrants
 */
export class Quadrants<T extends IQuadItem> {
  TL: Node<T> = null;
  TR: Node<T> = null;
  BL: Node<T> = null;
  BR: Node<T> = null;

  /**
   * Ensures all memory is released for all nodes and all references are removed
   * to potentially high memory consumption items
   *
   * @memberOf Quadrants
   */
  destroy() {
    this.TL.destroy();
    this.TR.destroy();
    this.BL.destroy();
    this.BR.destroy();
    this.TL = null;
    this.TR = null;
    this.BL = null;
    this.BR = null;
  }

  /**
   * Creates an instance of Quadrants.
   *
   * @param bounds The bounds this will create quandrants for
   * @param depth  The child depth of this element
   *
   * @memberOf Quadrants
   */
  constructor(bounds: IQuadItem, depth: number) {
    const mid = bounds.mid;
    this.TL = new Node<T>(bounds.x, mid.x, bounds.y, mid.y, depth);
    this.TR = new Node<T>(mid.x, bounds.right, bounds.y, mid.y, depth);
    this.BL = new Node<T>(bounds.x, mid.x, mid.y, bounds.bottom, depth);
    this.BR = new Node<T>(mid.x, bounds.right, mid.y, bounds.bottom, depth);
  }
}

/**
 * The quad tree node. This Node will take in a certain population before dividing itself into
 * 4 quadrants which it will attempt to inject it's population into. If a member of the population
 * does not completely get injected into one of the quadrants it remains as a member of this node.
 *
 * @export
 * @class Node
 */
export class Node<T extends IQuadItem> {
  bounds: Bounds = null;
  children: T[] = [];
  depth: number = 0;
  nodes: Quadrants<T> = null;

  /**
   * Destroys this node and ensures all child nodes are destroyed as well.
   *
   * @memberOf Node
   */
  destroy() {
    this.children = null;
    this.bounds   = null;

    if (this.nodes) {
      this.nodes.destroy();
      this.nodes = null;
    }
  }

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
  constructor(left: number, right: number, top: number, bottom: number, depth?: number) {
    // If params insertted
    if (arguments.length >= 4) {
      this.bounds = new Bounds({
        height: top - bottom,
        width: right - left,
        x: left,
        y: top,
      });
    }

    // Otherwise, make tiny start area
    else {
      this.bounds = new Bounds({
        height: 1,
        width: 1,
        x: 0,
        y: 0,
      });
    }

    // Ensure the depth is set
    this.depth = depth || 0;
  }

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
  add(child: T, props: any): boolean {
    // This is the entry function for adding children, so we must first expand our top node
    // To cover the area that the child is located.
    // If we're in bounds, then let's just add the child
    if (child.isInside(this.bounds)) {
      return this.doAdd(child);
    }

    // Otherwise, we need to expand first
    else {
      this.cover(child);
      return this.add(child, props);
    }
  }

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
  addAll(children: T[], childrenProps?: any[]) {
    // Ensure the properties are at least defined
    childrenProps = childrenProps || [];

    // Make sure we cover the entire area of all the children.
    // We can speed this up a lot if we first calculate the total bounds the new children covers
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;

    // Get the dimensions of the new bounds
    children.forEach(child => {
      if (child.x < minX) { minX = child.x; }
      if (child.right > maxX)  { maxX = child.right; }
      if (child.bottom > maxY) { maxY = child.bottom; }
      if (child.y < minY) { minY = child.y; }
    });

    // Make sure our bounds includes the specified bounds
    this.cover(new Bounds({
      height: maxY - minY,
      width: maxX - minX,
      x: minX,
      y: minY,
    }));

    // Add all of the children into the tree
    children.forEach((child, index) => this.doAdd(child));
  }

  /**
   * Ensures this quad tree includes the bounds specified in it's spatial coverage.
   * This will cause all children to be re-injected into the tree.
   *
   * @param bounds The bounds to include in the tree's coverage
   *
   * @memberOf Node
   */
  cover(bounds: Bounds) {
    // If we are already covering the area: abort
    if (bounds.isInside(this.bounds)) {
      return;
    }

    // Make our bounds cover the new area
    this.bounds.encapsulate(bounds);
    this.bounds.x -= 1;
    this.bounds.y -= 1;
    this.bounds.width += 2;
    this.bounds.height += 4;
    // Get all of the children underneath this node
    const allChildren = this.gatherChildren([]);

    // Destroy the split nodes
    if (this.nodes) {
      // Completely...destroy...
      this.nodes.destroy();
      this.nodes = null;
    }

    // Reinsert all children with the new dimensions in place
    allChildren.forEach((child, index) => this.doAdd(child));
  }

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
  doAdd(child : T) : boolean {
    // If nodes are present, then we have already exceeded the population of this node
    if (this.nodes) {
      if (child.isInside(this.nodes.TL.bounds)) {
        return this.nodes.TL.doAdd(child);
      }

      if (child.isInside(this.nodes.TR.bounds)) {
        return this.nodes.TR.doAdd(child);
      }

      if (child.isInside(this.nodes.BL.bounds)) {
        return this.nodes.BL.doAdd(child);
      }

      if (child.isInside(this.nodes.BR.bounds)) {
        return this.nodes.BR.doAdd(child);
      }

      // Otherwise, this is a child overlapping this border
      this.children.push(child);

      return true;
    }

    // Otherwise, we have not had a split due to population limits being exceeded
    else if (child.isInside(this.bounds)) {
      this.children.push(child);

      // If we exceeded our population for this quadrant, it is time to split up
      if (this.children.length > maxPopulation && this.depth < maxDepth) {
        this.split();
      }

      return true;
    }

    // This is when there is something wrong with the insertted child. The bounds
    // For the quad should have grown without issue, but in this case the bounds
    // Could not grow to accomodate the child.
    if (isNaN(child.width + child.height + child.x + child.y)) {
      console.error('Child did not fit into bounds because a dimension is NaN', child);
    }

    else if (child.area === 0) {
      console.error('Child did not fit into bounds because the area is zero', child);
    }

    // Don't insert the child and continue
    return true;
  }

  /**
   * Collects all children of all the current and sub nodes into a single list.
   *
   * @param list The list we must aggregate children into
   *
   * @return The list specified as the list parameter
   */
  gatherChildren(list: T[]): T[] {
    list = list.concat(this.children);

    if (this.nodes) {
      this.nodes.TL.gatherChildren(list);
      this.nodes.TR.gatherChildren(list);
      this.nodes.BL.gatherChildren(list);
      this.nodes.BR.gatherChildren(list);
    }

    return list;
  }

  /**
   * Entry query for determining query type based on input object
   *
   * @param bounds Can be a Bounds or a Point object
   * @param visit  A callback function that will receive the Node as it is analyzed. This gives
   *               information on a spatial scale, how a query reaches it's target intersections.
   *
   * @return An array of children that intersects with the query
   */
  query(bounds: IQuadItem | IPoint, visit?: IVisitFunction<T>): T[] {
    // Query a rectangle
    if (bounds instanceof Bounds) {
      if (bounds.hitBounds(this.bounds)) {
        return this.queryBounds(bounds, [], visit);
      }

      // Return an empty array when nothing is collided with
      return [];
    }

   // Query a point
    if (this.bounds.containsPoint(bounds)) {
      return this.queryPoint(bounds, [], visit);
    }

    // Return an empty array when nothing is collided with
    return [];
  }

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
  queryBounds(b: IQuadItem, list: T[], visit?: IVisitFunction<T>) : T[] {
    this.children.forEach((c, index) => {
      if (c.hitBounds(b)) {
        list.push(c);
      }
    });

    if (visit) {
      visit(this);
    }

    if (this.nodes) {
      if (b.hitBounds(this.nodes.TL.bounds)) {
        this.nodes.TL.queryBounds(b, list, visit);
      }

      if (b.hitBounds(this.nodes.TR.bounds)) {
        this.nodes.TR.queryBounds(b, list, visit);
      }

      if (b.hitBounds(this.nodes.BL.bounds)) {
        this.nodes.BL.queryBounds(b, list, visit);
      }

      if (b.hitBounds(this.nodes.BR.bounds)) {
        this.nodes.BR.queryBounds(b, list, visit);
      }

    }

    return list;
  }

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
  queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[] {
    this.children.forEach((c, index) => {
      if (c.containsPoint(p)) {
        list.push(c);
      }
    });

    if (visit) {
      visit(this);
    }

    if (this.nodes) {
      if (this.nodes.TL.bounds.containsPoint(p)) {
        this.nodes.TL.queryPoint(p, list, visit);
      }

      if (this.nodes.TR.bounds.containsPoint(p)) {
        this.nodes.TR.queryPoint(p, list, visit);
      }

      if (this.nodes.BL.bounds.containsPoint(p)) {
        this.nodes.BL.queryPoint(p, list, visit);
      }

      if (this.nodes.BR.bounds.containsPoint(p)) {
        this.nodes.BR.queryPoint(p, list, visit);
      }

    }

    return list;
  }

  /**
   * Creates four sub quadrants for this node.
   */
  split() {
    // Gather all items to be handed down
    const allChildren = this.gatherChildren([]);
    // Gather all props for the children to be handed down as well
    this.nodes = new Quadrants<T>(this.bounds, this.depth + 1);

    this.children = [];

    while (allChildren.length > 0) {
      this.doAdd(allChildren.pop());
    }
  }

  /**
   * Traverses the quad tree returning every quadrant encountered
   *
   * @param cb A callback that has the parameter (node) which is a quadrant in the tree
   */
  visit(cb: IVisitFunction<T>) : void {
    const finished = Boolean(cb(this));

    if (this.nodes && !finished) {
      this.nodes.TL.visit(cb);
      this.nodes.TR.visit(cb);
      this.nodes.BL.visit(cb);
      this.nodes.BR.visit(cb);
    }
  }
}

export class QuadTree<T extends IQuadItem> extends Node<T> {}
