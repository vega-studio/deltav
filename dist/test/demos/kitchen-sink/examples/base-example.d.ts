import { ChartCamera, EventManager, IInstanceProvider, Instance, LayerInitializer, Surface } from "src";
export declare type TestResourceKeys = {
    atlas: string;
    font: string;
};
export declare abstract class BaseExample {
    surface: Surface;
    view: string;
    destroy(): void;
    keyEvent(_e: KeyboardEvent, _isDown: boolean): void;
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(_resources: TestResourceKeys, _provider: IInstanceProvider<Instance>): LayerInitializer | LayerInitializer[];
    abstract makeProvider(): IInstanceProvider<Instance>;
}
