import { ChartCamera, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class SingleAxisLabelScaling extends BaseExample {
    providers: {
        always: InstanceProvider<LabelInstance>;
        never: InstanceProvider<LabelInstance>;
        bound: InstanceProvider<LabelInstance>;
    };
    isYAxis: boolean | undefined;
    layers: LayerInitializer[];
    constructor(yAxis?: boolean);
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, resource: TestResourceKeys, _provider: InstanceProvider<LabelInstance>): LayerInitializer[];
    makeProvider(): InstanceProvider<LabelInstance>;
}
