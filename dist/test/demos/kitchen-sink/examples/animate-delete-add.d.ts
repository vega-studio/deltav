import { CircleInstance, IInstanceProvider, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class AnimateDeleteAdd extends BaseExample {
    makeLayer(_resources: TestResourceKeys, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): IInstanceProvider<CircleInstance>;
}
