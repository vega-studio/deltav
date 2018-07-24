import { ImageInstance, InstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class Images extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<ImageInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<ImageInstance>;
}
