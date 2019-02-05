import { ChartCamera, EdgeInstance, EventManager, InstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class MouseScroll extends BaseExample {
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
