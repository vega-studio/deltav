import * as datGUI from "dat.gui";
import { BasicCameraController, ChartCamera, CircleInstance, InstanceProvider, ISceneOptions, LayerInitializer, Vec2 } from "src";
import { BaseDemo } from "../common/base-demo";
import { EventHandler } from "../common/event-handler";
export declare class BasicDemo extends BaseDemo {
    camera: ChartCamera;
    circles: CircleInstance[];
    shakeTimer: number;
    providers: {
        circles: InstanceProvider<CircleInstance>;
    };
    parameters: {
        count: number;
        radius: number;
        previous: {
            count: number;
        };
    };
    currentLocation: Vec2;
    buildConsole(gui: datGUI.GUI): void;
    destroy(): void;
    getEventManagers(defaultController: BasicCameraController, _defaultCamera: ChartCamera): (BasicCameraController | EventHandler)[];
    getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null;
    getLayers(): LayerInitializer[];
    init(): Promise<void>;
    makeCircle(): void;
    moveToLocation(location: Vec2): void;
    removeCircle(): void;
    shakeCircles(): void;
}
