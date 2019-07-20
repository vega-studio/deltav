import { Bounds } from "../math/primitives/bounds";
import { Vec2 } from "../math/vector";
export declare type IQuadTreeItem = Bounds<any>;
export declare function filterQuery<T extends IQuadTreeItem>(type: Function[], queryValues: IQuadTreeItem[]): T[];
export interface IQuadTreeVisitFunction<T extends IQuadTreeItem> {
    (node: QuadTreeNode<T>, child?: IQuadTreeItem): void;
}
export declare class QuadTreeQuadrants<T extends IQuadTreeItem> {
    TL: QuadTreeNode<T>;
    TR: QuadTreeNode<T>;
    BL: QuadTreeNode<T>;
    BR: QuadTreeNode<T>;
    destroy(): void;
    constructor(bounds: IQuadTreeItem, depth: number);
}
export declare class QuadTreeNode<T extends IQuadTreeItem> {
    bounds: Bounds<never>;
    children: T[];
    depth: number;
    nodes: QuadTreeQuadrants<T>;
    destroy(): void;
    constructor(left: number, right: number, top: number, bottom: number, depth?: number);
    add(child: T, props: any): boolean;
    addAll(children: T[]): void;
    cover(bounds: IQuadTreeItem): void;
    doAdd(child: T): boolean;
    gatherChildren(list: T[], visit?: IQuadTreeVisitFunction<T>): T[];
    query(bounds: IQuadTreeItem | Vec2, visit?: IQuadTreeVisitFunction<T>): T[];
    queryBounds(b: IQuadTreeItem, list: T[], visit?: IQuadTreeVisitFunction<T>): T[];
    queryPoint(p: any, list: T[], visit?: IQuadTreeVisitFunction<T>): T[];
    split(): void;
    visit(cb: IQuadTreeVisitFunction<T>): void;
}
export declare class QuadTree<T extends IQuadTreeItem> extends QuadTreeNode<T> {
}
