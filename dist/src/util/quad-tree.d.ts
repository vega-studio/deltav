import { Bounds } from "../primitives/bounds";
import { Vec2 } from "./vector";
export declare type IQuadItem = Bounds<any>;
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
    bounds: Bounds<never>;
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
    query(bounds: IQuadItem | Vec2, visit?: IVisitFunction<T>): T[];
    queryBounds(b: IQuadItem, list: T[], visit?: IVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: IVisitFunction<T>): T[];
    split(): void;
    visit(cb: IVisitFunction<T>): void;
}
export declare class QuadTree<T extends IQuadItem> extends Node<T> {
}
