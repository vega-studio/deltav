import { InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class LabelAnchorsAndScales extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
