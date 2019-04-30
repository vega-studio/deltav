import { ChartCamera, InstanceProvider, LayerInitializer, RingInstance } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class BoxOfRings extends BaseExample {
    camera: ChartCamera;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, _resource: TestResourceKeys, provider: InstanceProvider<RingInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RingInstance>;
}
