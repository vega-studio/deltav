import { Transform } from "./transform";
export declare class Node3D {
    localVisible: boolean;
    branchVisible: boolean;
    visibleInGraph: boolean;
    readonly local: Transform;
    private _local;
    readonly parent: Node3D | null;
    private _parent;
    readonly world: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _world;
}
