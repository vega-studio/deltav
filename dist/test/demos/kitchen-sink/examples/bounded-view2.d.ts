import { BasicCameraController, Bounds, ChartCamera, EventManager, InstanceProvider, LayerInitializer, RectangleInstance } from 'src';
import { BaseExample, TestResourceKeys } from './base-example';
export declare class BoundedView2 extends BaseExample {
    view: string;
    manager: BasicCameraController;
    originalRange: Bounds<never>;
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<RectangleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RectangleInstance>;
}
