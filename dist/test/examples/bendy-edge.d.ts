import { EdgeInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class BendyEdge extends BaseExample {
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
