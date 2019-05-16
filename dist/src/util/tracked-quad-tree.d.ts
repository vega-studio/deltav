import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { Vec2 } from "../util/vector";
export declare type TrackedQuadTreeBoundsAccessor<T extends Instance> = (o: T) => Bounds<any> | null;
export interface ITrackedQuadTreeVisitFunction<T extends Instance> {
    (node: TrackedQuadtreeNode<T>, child?: Bounds<any>): void;
}
export declare class TrackedQuadTreeQuadrants<T extends Instance> {
    TL: TrackedQuadtreeNode<T>;
    TR: TrackedQuadtreeNode<T>;
    BL: TrackedQuadtreeNode<T>;
    BR: TrackedQuadtreeNode<T>;
    destroy(): void;
    constructor(bounds: Bounds<any>, depth: number, getBounds: TrackedQuadTreeBoundsAccessor<T>, childToNode: Map<T, TrackedQuadtreeNode<T>>, childToBounds: Map<T, Bounds<any> | null>);
}
export declare class TrackedQuadtreeNode<T extends Instance> {
    bounds: Bounds<any>;
    children: T[];
    childToNode: Map<T, TrackedQuadtreeNode<T>>;
    childToBounds: Map<T, Bounds<any> | null>;
    depth: number;
    getBounds: TrackedQuadTreeBoundsAccessor<T>;
    nodes: TrackedQuadTreeQuadrants<T> | null;
    nullBounded: T[];
    destroy(): void;
    constructor(left: number, right: number, top: number, bottom: number, getBounds: TrackedQuadTreeBoundsAccessor<T>, depth?: number);
    add(child: T): boolean;
    addAll(children: T[]): void;
    cover(bounds: Bounds<any>): void;
    private doAdd;
    private doRemove;
    gatherChildren(list: T[]): T[];
    query(bounds: Bounds<T> | Vec2, visit?: ITrackedQuadTreeVisitFunction<T>): T[];
    queryBounds(b: Bounds<any>, list: T[], visit?: ITrackedQuadTreeVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: ITrackedQuadTreeVisitFunction<T>): T[];
    remove(child: T): void;
    split(): void;
    visit(cb: ITrackedQuadTreeVisitFunction<T>): void;
}
export declare class TrackedQuadTree<T extends Instance> extends TrackedQuadtreeNode<T> {
}
