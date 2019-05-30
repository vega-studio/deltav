import { InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class LabelAnimatedScale extends BaseExample {
    minScale: number;
    maxScale: number;
    scaleStep: number;
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
