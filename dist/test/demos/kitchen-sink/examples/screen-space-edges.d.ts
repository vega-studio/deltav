import { ChartCamera, EdgeInstance, InstanceProvider, IPickInfo, LayerInitializer, ReferenceCamera } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class ScreenSpaceEdges extends BaseExample {
    side: number;
    camera: ReferenceCamera;
    shiftIsDown: boolean;
    handleMouseOut: (info: IPickInfo<EdgeInstance>) => void;
    handleMouseMove: (info: IPickInfo<EdgeInstance>) => void;
    keyEvent(e: KeyboardEvent, _isDown: boolean): void;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
