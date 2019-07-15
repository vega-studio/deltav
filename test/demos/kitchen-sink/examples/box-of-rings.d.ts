import { Camera2D, InstanceProvider, LayerInitializer, RingInstance } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class BoxOfRings extends BaseExample {
    camera: Camera2D;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<RingInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RingInstance>;
}
