import { Camera2D, EdgeInstance, InstanceProvider, IPickInfo, LayerInitializer, ReferenceCamera2D } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class ScreenSpaceEdges extends BaseExample {
    side: number;
    camera: ReferenceCamera2D;
    shiftIsDown: boolean;
    handleMouseOut: (info: IPickInfo<EdgeInstance>) => void;
    handleMouseMove: (info: IPickInfo<EdgeInstance>) => void;
    keyEvent(e: KeyboardEvent, _isDown: boolean): void;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
