import { EdgeInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class BendyEdge extends BaseExample {
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}