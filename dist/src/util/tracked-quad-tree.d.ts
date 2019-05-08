import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { Vec2 } from "../util/vector";
export declare type BoundsAccessor<T extends Instance> = (o: T) => Bounds<any> | null;
export interface IVisitFunction<T extends Instance> {
    (node: Node<T>, child?: Bounds<any>): void;
}
export declare class Quadrants<T extends Instance> {
    TL: Node<T>;
    TR: Node<T>;
    BL: Node<T>;
    BR: Node<T>;
    destroy(): void;
    constructor(bounds: Bounds<any>, depth: number, getBounds: BoundsAccessor<T>, childToNode: Map<T, Node<T>>, childToBounds: Map<T, Bounds<any> | null>);
}
export declare class Node<T extends Instance> {
    bounds: Bounds<any>;
    children: T[];
    childToNode: Map<T, Node<T>>;
    childToBounds: Map<T, Bounds<any> | null>;
    depth: number;
    getBounds: BoundsAccessor<T>;
    nodes: Quadrants<T> | null;
    nullBounded: T[];
    destroy(): void;
    constructor(left: number, right: number, top: number, bottom: number, getBounds: BoundsAccessor<T>, depth?: number);
    add(child: T): boolean;
    addAll(children: T[]): void;
    cover(bounds: Bounds<any>): void;
    private doAdd;
    private doRemove;
    gatherChildren(list: T[]): T[];
    query(bounds: Bounds<any> | Vec2, visit?: IVisitFunction<T>): T[];
    queryBounds(b: Bounds<any>, list: T[], visit?: IVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[];
    remove(child: T): void;
    split(): void;
    visit(cb: IVisitFunction<T>): void;
}
export declare class TrackedQuadTree<T extends Instance> extends Node<T> {
}
