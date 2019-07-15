import { BasicCamera2DController, Camera2D, CircleInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteraction extends BaseExample {
    isOver: Map<CircleInstance, boolean>;
    hasLeft: Map<CircleInstance, boolean>;
    makeController(defaultCamera: Camera2D, _testCamera: Camera2D, viewName: string): BasicCamera2DController;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<CircleInstance>;
}
