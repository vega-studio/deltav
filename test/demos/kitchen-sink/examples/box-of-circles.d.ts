import { BasicCamera2DController, Bounds, Camera2D, CircleInstance, EventManager, IAutoEasingMethod, IInstanceProvider, InstanceProvider, LayerInitializer, Vec, Vec2 } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class BoxOfCircles extends BaseExample {
    animationControl: {
        center: IAutoEasingMethod<Vec>;
        color: IAutoEasingMethod<Vec>;
        radius: IAutoEasingMethod<Vec>;
    };
    camera: Camera2D;
    manager: BasicCamera2DController;
    originalRange: Bounds<never>;
    scene: string;
    textPositions: Vec2[];
    textCache: {
        buckets: CircleInstance[][];
        xy: Vec2[];
    };
    keyEvent(e: KeyboardEvent, _isDown: boolean): void;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): EventManager;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    private moveToText;
    makeProvider(): IInstanceProvider<CircleInstance>;
}
