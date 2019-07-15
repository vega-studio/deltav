import { Camera2D, EventManager, InstanceProvider, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class FontEngineGlyphControl extends BaseExample {
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): EventManager;
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
