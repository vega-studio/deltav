import { ChartCamera, EventManager, IInstanceProvider, Instance, LayerInitializer, LayerSurface } from "src";
export declare abstract class BaseExample {
    surface: LayerSurface;
    view: string;
    keyEvent(_e: KeyboardEvent, _isDown: boolean): void;
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, _atlas: string, provider: IInstanceProvider<Instance>): LayerInitializer | LayerInitializer[];
    abstract makeProvider(): IInstanceProvider<Instance>;
}