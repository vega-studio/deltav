import { CircleInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteraction extends BaseExample {
    isOver: Map<CircleInstance, boolean>;
    hasLeft: Map<CircleInstance, boolean>;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<CircleInstance>;
}