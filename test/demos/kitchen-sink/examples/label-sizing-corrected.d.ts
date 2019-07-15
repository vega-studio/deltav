import { Camera2D, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class LabelSizingCorrected extends BaseExample {
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeProvider(): InstanceProvider<LabelInstance>;
}
