import { ChartCamera, EventManager, IInstanceProvider, Instance, LayerInitializer, LayerSurface } from 'src';
export declare abstract class BaseExample {
    surface: LayerSurface;
    view: string;
    keyEvent(e: KeyboardEvent, isDown: boolean): void;
    makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, atlas: string, provider: IInstanceProvider<Instance>): LayerInitializer | LayerInitializer[];
    abstract makeProvider(): IInstanceProvider<Instance>;
}
