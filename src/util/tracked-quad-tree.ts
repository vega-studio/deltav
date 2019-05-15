import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { isVec2, Vec2 } from "../util/vector";

// A configuration that controls how readily a quadtree will split to another level
// Adjusting this number can improve or degrade your performance significantly and
// Must be tested for specific use cases
const maxPopulation: number = 5;
const maxDepth: number = 10;

export type TrackedQuadTreeBoundsAccessor<T extends Instance> = (
  o: T
) => Bounds<any> | null;

/**
 * Allows typing of a callback argument
 */
export interface ITrackedQuadTreeVisitFunction<T extends Instance> {
  /**
   * A callback to use during add or query
   *
   * Called do provide aggregation or filtering like Array.reduce or
   * Array.filter, but in a QuadTree instead.
   *
   * @param node  The node to effect the function upon
   * @param child The child to add to the node
   */
  (node: TrackedQuadtreeNode<T>, child?: Bounds<any>): void;
}

/**
 * This is a class used specifically by the quad tree nodes to indicate split space
 * within the quad tree.
 */
export class TrackedQuadTreeQuadrants<T extends Instance> {
  TL: TrackedQuadtreeNode<T>;
  TR: TrackedQuadtreeNode<T>;
  BL: TrackedQuadtreeNode<T>;
  BR: TrackedQuadtreeNode<T>;

  /**
   * Ensures all memory is released for all nodes and all references are removed
   * to potentially high memory consumption items
   */
  destroy() {
    this.TL.destroy();
    this.TR.destroy();
    this.BL.destroy();
    this.BR.destroy();
    delete this.TL;
    delete this.TR;
    delete this.BL;
    delete this.BR;
  }

  /**
   * Creates an instance of Quadrants.
   *
   * @param bounds The bounds this will create quandrants for
   * @param depth  The child depth of this element
   */
  constructor(
    bounds: Bounds<any>,
    depth: number,
    getBounds: TrackedQuadTreeBoundsAccessor<T>,
    childToNode: Map<T, TrackedQuadtreeNode<T>>,
    childToBounds: Map<T, Bounds<any> | null>
  ) {
    const mid = bounds.mid;
    this.TL = new TrackedQuadtreeNode<T>(
      bounds.x,
      mid[0],
      bounds.y,
      mid[1],
      getBounds,
      depth
    );
    this.TR = new TrackedQuadtreeNode<T>(
      mid[0],
      bounds.right,
      bounds.y,
      mid[1],
      getBounds,
      depth
    );
    this.BL = new TrackedQuadtreeNode<T>(
      bounds.x,
      mid[0],
      mid[1],
      bounds.bottom,
      getBounds,
      depth
    );
    this.BR = new TrackedQuadtreeNode<T>(
      mid[0],
      bounds.right,
      mid[1],
      bounds.bottom,
      getBounds,
      depth
    );
    this.TL.childToNode = childToNode;
    this.TR.childToNode = childToNode;
    this.BL.childToNode = childToNode;
    this.BR.childToNode = childToNode;
    this.TL.childToBounds = childToBounds;
    this.TR.childToBounds = childToBounds;
    this.BL.childToBounds = childToBounds;
    this.BR.childToBounds = childToBounds;
  }
}

/**
 * The quad tree node. This Node will take in a certain population before dividing itself into
 * 4 quadrants which it will attempt to inject it's population into. If a member of the population
 * does not completely get injected into one of the quadrants it remains as a member of this node.
 */
export class TrackedQuadtreeNode<T extends Instance> {
  /** This is the amount of space this node covers */
  bounds: Bounds<any>;
  /** These are the child Instances of the node. */
  children: T[] = [];
  /**
   * This tracks a quick lookup of a child to it's parent node. This is used so the child can
   * be removed with ease and not require a traversal of the tree.
   */
  childToNode: Map<T, TrackedQuadtreeNode<T>>;
  /** This tracks the bounds calcuated for the given instance */
  childToBounds: Map<T, Bounds<any> | null>;
  /** This is how deep the node is within the tree */
  depth: number = 0;
  /** This is the accessor method that retrieves the bounds for an injected instance */
  getBounds: TrackedQuadTreeBoundsAccessor<T>;
  /** These are the child nodes of this quad node when this node is split. It is null if the node is not split yet */
  nodes: TrackedQuadTreeQuadrants<T> | null = null;
  /**
   * These are children with null bounds that do not affect the splitting and ALWAYS get checked every query.
   * They should only reside on the top node.
   */
  nullBounded: T[];

  /**
   * Destroys this node and ensures all child nodes are destroyed as well.
   */
  destroy() {
    delete this.children;
    delete this.bounds;

    if (this.nodes) {
      this.nodes.destroy();
      this.nodes = null;
    }
  }

  /**
   * Creates an instance of Node.
   */
  constructor(
    left: number,
    right: number,
    top: number,
    bottom: number,
    getBounds: TrackedQuadTreeBoundsAccessor<T>,
    depth: number = 0
  ) {
    // If params insertted
    if (arguments.length >= 4) {
      this.bounds = new Bounds({ left, right, top, bottom });
    } else {
      // Otherwise, make tiny start area
      this.bounds = new Bounds({ left: 0, right: 1, top: 1, bottom: 0 });
    }

    // Ensure the depth is set
    this.depth = depth;
    // Apply the bounds accessor method for instances
    this.getBounds = getBounds;

    // If this is the top level node, we need to instantiate the lookup that will be used
    // Across all nodes.
    if (this.depth === 0) {
      this.nullBounded = [];
      this.childToNode = new Map<T, TrackedQuadtreeNode<T>>();
      this.childToBounds = new Map<T, Bounds<any>>();
    }
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
   */
  add(child: T): boolean {
    let bounds = this.childToBounds.get(child);

    if (!bounds) {
      // First we access the bounds of the child and store it
      bounds = this.getBounds(child);
      this.childToBounds.set(child, bounds);
    }

    // This is the entry function for adding children, so we must first expand our top node
    // To cover the area that the child is located.
    // If we're in bounds, then let's just add the child
    if (!bounds || bounds.isInside(this.bounds)) {
      return this.doAdd(child, bounds);
    } else {
      // Otherwise, we need to expand first
      this.cover(bounds);
      return this.add(child);
    }
  }

  /**
   * Adds a list of new children to this quad tree. It performs the same operations as
   * addChild for each child in the list, however, it more efficiently recalculates the
   * bounds necessary to cover the area the children cover.
   *
   * @param children      List of Bounds objects to inject
   */
  addAll(children: T[]) {
    // Make sure we cover the entire area of all the children.
    // We can speed this up a lot if we first calculate the total bounds the new children covers
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;

    // Get the dimensions of the new bounds
    children.forEach(child => {
      const bounds = this.getBounds(child);
      this.childToBounds.set(child, bounds);
      if (!bounds) return;

      if (bounds.x < minX) {
        minX = bounds.x;
      }
      if (bounds.right > maxX) {
        maxX = bounds.right;
      }
      if (bounds.bottom > maxY) {
        maxY = bounds.bottom;
      }
      if (bounds.y < minY) {
        minY = bounds.y;
      }
    });

    // Ensure a valid cover dimension was established. If no valid dimension is established
    // Then we don't cover, but we can still add the children as that have null Bounds which
    // Means injecting at the top level.
    if (
      minX !== Number.MAX_VALUE &&
      minY !== Number.MAX_VALUE &&
      maxX !== -Number.MAX_VALUE &&
      maxY !== -Number.MAX_VALUE
    ) {
      // Make sure our bounds includes the specified bounds
      this.cover(
        new Bounds({ left: minX, right: maxX, bottom: maxY, top: minY })
      );
    }

    // Add all of the children into the tree.
    children.forEach(child =>
      this.doAdd(child, this.childToBounds.get(child) || null, true)
    );
  }

  /**
   * Ensures this quad tree includes the bounds specified in it's spatial coverage.
   * This will cause all children to be re-injected into the tree.
   *
   * @param bounds The bounds to include in the tree's coverage
   */
  cover(bounds: Bounds<any>) {
    // If we are already covering the area: abort
    if (bounds.isInside(this.bounds)) {
      return;
    }

    // Make our bounds cover the new area
    this.bounds.encapsulate(bounds);
    this.bounds.x -= 1;
    this.bounds.y -= 1;
    this.bounds.width += 2;
    this.bounds.height += 2;
    // Get all of the children underneath this node
    const allChildren = this.gatherChildren([]);
    this.children = [];

    // Destroy the split nodes
    if (this.nodes) {
      // Completely...destroy...
      this.nodes.destroy();
      this.nodes = null;
    }

    // Clear out the child to node relations
    this.childToNode.clear();
    // Reinsert all children with the new dimensions in place
    allChildren.forEach(child =>
      this.doAdd(child, this.childToBounds.get(child) || null)
    );
  }

  /**
   * When adding children, this performs the actual action of injecting the child into the tree
   * without the process of seeing if the tree needs a spatial adjustment to account for the child.
   *
   * @param child The Bounds item to inject into the tree
   * @param props The props to remain associated with the child
   *
   * @returns True if the injection was successful
   */
  private doAdd(
    child: T,
    bounds: Bounds<any> | null,
    fromSplit?: boolean
  ): boolean {
    // If this is the top level node and the bounds are null, then we add to the null list
    if (!bounds && this.depth === 0) {
      this.nullBounded.push(child);
      this.childToNode.set(child, this);

      return true;
    }

    // If no bounds is available at this point, something went terribly wrong
    if (!bounds) {
      console.warn(
        "A null bounds was added to a Quad Tree node below the top node, which is invalid."
      );
      return false;
    }

    // If bounds are null, then just immediately add
    // If nodes are present, then we have already exceeded the population of this node
    if (this.nodes) {
      if (bounds.isInside(this.nodes.TL.bounds)) {
        return this.nodes.TL.doAdd(child, bounds, fromSplit);
      }

      if (bounds.isInside(this.nodes.TR.bounds)) {
        return this.nodes.TR.doAdd(child, bounds, fromSplit);
      }

      if (bounds.isInside(this.nodes.BL.bounds)) {
        return this.nodes.BL.doAdd(child, bounds, fromSplit);
      }

      if (bounds.isInside(this.nodes.BR.bounds)) {
        return this.nodes.BR.doAdd(child, bounds, fromSplit);
      }

      // Otherwise, this is a child overlapping this border
      this.children.push(child);
      this.childToNode.set(child, this);

      return true;
    } else if (bounds.isInside(this.bounds)) {
      // Otherwise, we have not had a split due to population limits being exceeded
      this.children.push(child);
      this.childToNode.set(child, this);

      // If we exceeded our population for this quadrant, it is time to split up
      if (this.children.length > maxPopulation && this.depth < maxDepth) {
        this.split();
      }

      return true;
    }

    // This is when there is something wrong with the insertted child. The bounds
    // For the quad should have grown without issue, but in this case the bounds
    // Could not grow to accomodate the child.
    if (isNaN(bounds.width + bounds.height + bounds.x + bounds.y)) {
      console.error(
        "Child did not fit into bounds because a dimension is NaN",
        child,
        bounds
      );
    } else if (bounds.area === 0) {
      console.error(
        "Child did not fit into bounds because the area is zero",
        child,
        bounds
      );
    } else {
      console.error(
        "Child did not get insertted.",
        "Parent:",
        this.bounds.toString(),
        "Child:",
        bounds.toString(),
        "Inside Checks:",
        bounds.x >= this.bounds.x,
        bounds.right <= this.bounds.right,
        bounds.y >= this.bounds.y,
        bounds.bottom <= this.bounds.bottom
      );
    }

    // Don't insert the child and continue
    return true;
  }

  private doRemove(child: T) {
    const index = this.children.indexOf(child);

    if (index > -1) {
      this.children.splice(index, 1);
      this.childToNode.delete(child);
      this.childToBounds.delete(child);
    }
  }

  /**
   * Collects all children of all the current and sub nodes into a single list.
   *
   * @param list The list we must aggregate children into
   *
   * @return The list specified as the list parameter
   */
  gatherChildren(list: T[]): T[] {
    this.children.forEach(child => list.push(child));

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
  query(
    bounds: Bounds<T> | Vec2,
    visit?: ITrackedQuadTreeVisitFunction<T>
  ): T[] {
    // This stores all of the found Instances when querying by bounds or point
    let found: T[] = [];

    // If this is the top level node then add in the null bunded items as the start
    if (this.depth === 0) {
      found = this.nullBounded.slice(0);
    }

    // Query a rectangle
    if (bounds instanceof Bounds) {
      if (bounds.hitBounds(this.bounds)) {
        return this.queryBounds(bounds, found, visit);
      }
    }

    if (isVec2(bounds)) {
      // Query a point
      if (this.bounds.containsPoint(bounds)) {
        return this.queryPoint(bounds, found, visit);
      }
    }

    // Return an empty array when nothing is collided with
    return found;
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
  queryBounds(
    b: Bounds<any>,
    list: T[],
    visit?: ITrackedQuadTreeVisitFunction<T>
  ): T[] {
    this.children.forEach(c => {
      const bounds = this.childToBounds.get(c);

      if (bounds && bounds.hitBounds(b)) {
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
  queryPoint(p: any, list: T[], visit?: ITrackedQuadTreeVisitFunction<T>): T[] {
    this.children.forEach(c => {
      const bounds = this.childToBounds.get(c);

      if (bounds && bounds.containsPoint(p)) {
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
   * Remove the provided item from the tree.
   */
  remove(child: T) {
    if (this.childToNode) {
      const node = this.childToNode.get(child);

      // If the node is getting removed from the top level node, then it MAY be a null bounded item
      // Which gets removed from the list
      if (node && node.depth === 0) {
        const index = node.nullBounded.indexOf(child);

        if (index > -1) {
          node.nullBounded.splice(index);
          this.childToNode.delete(child);
          this.childToBounds.delete(child);

          return;
        }
      }

      // Otherwise, just remove the node normally
      if (node) {
        node.doRemove(child);
      }
    }
  }

  /**
   * Creates four sub quadrants for this node.
   */
  split() {
    // Gather all items to be handed down
    const allChildren = this.gatherChildren([]);
    // Gather all props for the children to be handed down as well
    this.nodes = new TrackedQuadTreeQuadrants<T>(
      this.bounds,
      this.depth + 1,
      this.getBounds,
      this.childToNode,
      this.childToBounds
    );
    // Empty out the children as they are being re-injected
    this.children = [];

    for (let i = 0, end = allChildren.length; i < end; ++i) {
      const child = allChildren[i];
      this.doAdd(child, this.childToBounds.get(child) || null, true);
    }
  }

  /**
   * Traverses the quad tree returning every quadrant encountered
   *
   * @param cb A callback that has the parameter (node) which is a quadrant in the tree
   */
  visit(cb: ITrackedQuadTreeVisitFunction<T>): void {
    const finished = Boolean(cb(this));

    if (this.nodes && !finished) {
      this.nodes.TL.visit(cb);
      this.nodes.TR.visit(cb);
      this.nodes.BL.visit(cb);
      this.nodes.BR.visit(cb);
    }
  }
}

export class TrackedQuadTree<T extends Instance> extends TrackedQuadtreeNode<
  T
> {}
