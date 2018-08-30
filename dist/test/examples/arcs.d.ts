import { ArcInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class Arcs extends BaseExample {
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<ArcInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<ArcInstance>;
}
