import { EdgeInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class Blending extends BaseExample {
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer[];
    makeProvider(): InstanceProvider<EdgeInstance>;
}
