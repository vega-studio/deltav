import { ImageInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class Images extends BaseExample {
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<ImageInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<ImageInstance>;
}
