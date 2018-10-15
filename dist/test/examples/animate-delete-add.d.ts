import { CircleInstance, IInstanceProvider, InstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class AnimateDeleteAdd extends BaseExample {
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): IInstanceProvider<CircleInstance>;
}
