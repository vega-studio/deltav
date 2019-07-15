import { Camera2D, EventManager, IInstanceProvider, Instance, LayerInitializer, Surface } from "src";
export declare type TestResourceKeys = {
    atlas: string;
    font: string;
};
export declare abstract class BaseExample {
    surface: Surface;
    view: string;
    destroy(): void;
    keyEvent(_e: KeyboardEvent, _isDown: boolean): void;
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): EventManager;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeLayer(_resources: TestResourceKeys, _provider: IInstanceProvider<Instance>): LayerInitializer | LayerInitializer[];
    abstract makeProvider(): IInstanceProvider<Instance>;
}
