import { IPickingMethods } from '../../surface/layer';
import { EdgeInstance } from './edge-instance';
import { IEdgeLayerProps } from './edge-layer';
/**
 * This generates the picking methods needed for managing PickType.ALL for the edge layer.
 */
export declare function edgePicking(props: IEdgeLayerProps): IPickingMethods<EdgeInstance>;
