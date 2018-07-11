import { Bounds } from "../primitives/bounds";
import { IPoint } from "../primitives/point";
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
export declare function filterQuery<T extends IQuadItem>(type: Function[], queryValues: IQuadItem[]): T[];
export interface IVisitFunction<T extends IQuadItem> {
    (node: Node<T>, child?: IQuadItem): void;
}
export declare class Quadrants<T extends IQuadItem> {
    TL: Node<T>;
    TR: Node<T>;
    BL: Node<T>;
    BR: Node<T>;
    destroy(): void;
    constructor(bounds: IQuadItem, depth: number);
}
export declare class Node<T extends IQuadItem> {
    bounds: Bounds;
    children: T[];
    depth: number;
    nodes: Quadrants<T>;
    destroy(): void;
    constructor(left: number, right: number, top: number, bottom: number, depth?: number);
    add(child: T, props: any): boolean;
    addAll(children: T[], childrenProps?: any[]): void;
    cover(bounds: IQuadItem): void;
    doAdd(child: T): boolean;
    gatherChildren(list: T[]): T[];
    query(bounds: IQuadItem | IPoint, visit?: IVisitFunction<T>): T[];
    queryBounds(b: IQuadItem, list: T[], visit?: IVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[];
    split(): void;
    visit(cb: IVisitFunction<T>): void;
}
export declare class QuadTree<T extends IQuadItem> extends Node<T> {
}
