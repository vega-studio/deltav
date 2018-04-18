import { ChartCamera, DataProvider, EventManager, Instance, LayerInitializer } from '../../src';
export declare class BaseExample {
    makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, atlas: string, provider: DataProvider<Instance>): LayerInitializer;
    makeProvider(): DataProvider<Instance>;
}
