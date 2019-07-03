import { Camera2D, EdgeInstance, EventManager, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseScroll extends BaseExample {
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): EventManager;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
