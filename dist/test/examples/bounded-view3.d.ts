import { BasicCameraController, Bounds, ChartCamera, EventManager, InstanceProvider, LayerInitializer, RectangleInstance } from "src";
import { BaseExample } from "./base-example";
export declare class BoundedView3 extends BaseExample {
    view: string;
    manager: BasicCameraController;
    originalRange: Bounds;
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<RectangleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RectangleInstance>;
}
