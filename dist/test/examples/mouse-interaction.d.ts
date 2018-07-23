import { CircleInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class MouseInteraction extends BaseExample {
    isOver: Map<CircleInstance, boolean>;
    hasLeft: Map<CircleInstance, boolean>;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<CircleInstance>;
}
