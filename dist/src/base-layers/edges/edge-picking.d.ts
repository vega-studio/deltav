import { IPickingMethods } from "../../surface/layer";
import { EdgeInstance } from "./edge-instance";
import { IEdgeLayerProps } from "./edge-layer";
export declare function edgePicking<T extends EdgeInstance>(props: IEdgeLayerProps<T>): IPickingMethods<EdgeInstance>;
