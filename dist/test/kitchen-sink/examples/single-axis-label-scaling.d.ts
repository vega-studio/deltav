import { ChartCamera, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class SingleAxisLabelScaling extends BaseExample {
    isYAxis: boolean;
    constructor(yAxis?: boolean);
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
