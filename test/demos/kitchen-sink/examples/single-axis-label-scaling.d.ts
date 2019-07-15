import { Camera2D, InstanceProvider, LabelInstance, LayerInitializer } from "src";
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
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeLayer(resource: TestResourceKeys, _provider: InstanceProvider<LabelInstance>): LayerInitializer[];
    makeProvider(): InstanceProvider<LabelInstance>;
}
