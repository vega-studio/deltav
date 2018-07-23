import { ChartCamera, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class LabelSizingCorrected extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeProvider(): InstanceProvider<LabelInstance>;
}
