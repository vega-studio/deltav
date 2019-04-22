import { ArcInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class Arcs extends BaseExample {
    makeLayer(scene: string, _resource: TestResourceKeys, provider: InstanceProvider<ArcInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<ArcInstance>;
}
