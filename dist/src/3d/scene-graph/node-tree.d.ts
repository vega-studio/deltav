import { Node } from './node';
export declare class NodeTree<TParent extends NodeTree<any, any, any>, TChild extends NodeTree<any, any, any>, TSibling extends Node<any>> extends Node<TSibling> {
    readonly parent: TParent | undefined;
    private _parent?;
    readonly children: Map<number, TChild>;
    private _children;
    willMount(): void;
    didMount(): void;
}
