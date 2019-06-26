import { CircleInstance, EdgeInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteractionColorPicking extends BaseExample {
    edgeProvider: InstanceProvider<EdgeInstance>;
    side: number;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    handleEdgeMouseOut: (info: IPickInfo<EdgeInstance>) => void;
    handleEdgeMouseMove: (info: IPickInfo<EdgeInstance>) => void;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<CircleInstance>): LayerInitializer | LayerInitializer[];
    makeProvider(): InstanceProvider<CircleInstance>;
}
