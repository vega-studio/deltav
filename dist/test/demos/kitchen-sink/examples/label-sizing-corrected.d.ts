import { ChartCamera, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class LabelSizingCorrected extends BaseExample {
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeProvider(): InstanceProvider<LabelInstance>;
}
