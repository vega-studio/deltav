import { BasicCamera2DController, Bounds, Camera2D, EventManager, InstanceProvider, LayerInitializer, RectangleInstance } from 'src';
import { BaseExample, TestResourceKeys } from './base-example';
export declare class BoundedView2 extends BaseExample {
    view: string;
    manager: BasicCamera2DController;
    originalRange: Bounds<never>;
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): EventManager;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<RectangleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RectangleInstance>;
}
