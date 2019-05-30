import { ChartCamera, EdgeInstance, EventManager, InstanceProvider, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseScroll extends BaseExample {
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
