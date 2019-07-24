export declare abstract class Node<TSibling extends Node<any>> {
    readonly uid: number;
    private _uid;
    readonly siblings: ReadonlyMap<number, TSibling>;
    private _siblings;
    addSibling(sibling: TSibling, stopRecurse?: boolean): void;
    addSiblings(siblings: TSibling[]): void;
    remove(): void;
    removeSibling(sibling: TSibling, stopRecurse?: boolean): void;
    trigger(): void;
    abstract willMount(): void;
    abstract didMount(): void;
}
