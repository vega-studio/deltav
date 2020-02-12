import { Node } from './node';
/**
 * This extends the concept of a generic node and sibling structure and forces it into a tree structure by managing the
 * siblings in a manner that has a parent / child like structure.
 */
export declare class NodeTree<TParent extends NodeTree<any, any, any>, TChild extends NodeTree<any, any, any>, TSibling extends Node<any>> extends Node<TSibling> {
    readonly parent: TParent | undefined;
    private _parent?;
    readonly children: Map<number, TChild>;
    private _children;
    willMount(): void;
    didMount(): void;
}
