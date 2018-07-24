import { InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class LabelAnimatedScale extends BaseExample {
    minScale: number;
    maxScale: number;
    scaleStep: number;
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
