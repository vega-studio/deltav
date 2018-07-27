import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { IPoint } from "../primitives/point";
export declare type BoundsAccessor<T extends Instance> = (o: T) => Bounds | null;
export interface IVisitFunction<T extends Instance> {
    (node: Node<T>, child?: Bounds): void;
}
export declare class Quadrants<T extends Instance> {
    TL: Node<T>;
    TR: Node<T>;
    BL: Node<T>;
    BR: Node<T>;
    destroy(): void;
    constructor(bounds: Bounds, depth: number, getBounds: BoundsAccessor<T>, childToNode: Map<T, Node<T>>, childToBounds: Map<T, Bounds | null>);
}
export declare class Node<T extends Instance> {
    bounds: Bounds;
    children: T[];
    childToNode: Map<T, Node<T>>;
    childToBounds: Map<T, Bounds | null>;
    depth: number;
    getBounds: BoundsAccessor<T>;
    nodes: Quadrants<T> | null;
    nullBounded: T[];
    destroy(): void;
    constructor(left: number, right: number, top: number, bottom: number, getBounds: BoundsAccessor<T>, depth?: number);
    add(child: T): boolean;
    addAll(children: T[]): void;
    cover(bounds: Bounds): void;
    private doAdd;
    private doRemove;
    gatherChildren(list: T[]): T[];
    query(bounds: Bounds | IPoint, visit?: IVisitFunction<T>): T[];
    queryBounds(b: Bounds, list: T[], visit?: IVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[];
    remove(child: T): void;
    split(): void;
    visit(cb: IVisitFunction<T>): void;
}
export declare class TrackedQuadTree<T extends Instance> extends Node<T> {
}
