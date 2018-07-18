import { BasicCameraController, Bounds, ChartCamera, EventManager, InstanceProvider, LayerInitializer, RectangleInstance } from 'src';
import { BaseExample } from './base-example';
export declare class BoundedView2 extends BaseExample {
    view: string;
    manager: BasicCameraController;
    originalRange: Bounds;
    makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<RectangleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RectangleInstance>;
}
