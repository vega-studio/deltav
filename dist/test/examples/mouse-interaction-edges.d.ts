import { EdgeInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class MouseInteractionEdges extends BaseExample {
    side: number;
    handleMouseOut: (info: IPickInfo<EdgeInstance>) => void;
    handleMouseMove: (info: IPickInfo<EdgeInstance>) => void;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
