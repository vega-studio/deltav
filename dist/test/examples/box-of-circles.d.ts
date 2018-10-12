import { AnimationHelper, BasicCameraController, Bounds, ChartCamera, CircleInstance, EventManager, IAutoEasingMethod, IInstanceProvider, InstanceProvider, LayerInitializer, Vec, Vec2 } from "src";
import { BaseExample } from "./base-example";
export declare class BoxOfCircles extends BaseExample {
    animationControl: {
        center: IAutoEasingMethod<Vec>;
        color: IAutoEasingMethod<Vec>;
        radius: IAutoEasingMethod<Vec>;
    };
    animationHelper: AnimationHelper;
    camera: ChartCamera;
    manager: BasicCameraController;
    originalRange: Bounds;
    scene: string;
    textPositions: Vec2[];
    textCache: {
        buckets: CircleInstance[][];
        xy: Vec2[];
    };
    keyEvent(e: KeyboardEvent, _isDown: boolean): void;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeController(defaultCamera: ChartCamera, _testCamera: ChartCamera, viewName: string): EventManager;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    private moveToText;
    makeProvider(): IInstanceProvider<CircleInstance>;
}
