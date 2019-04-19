import * as datGUI from "dat.gui";
import { BasicCameraController, Bounds, ChartCamera, CircleInstance, InstanceProvider, ISceneOptions, LayerInitializer } from "src";
import { BaseDemo } from "../common/base-demo";
import { EventHandler } from "../common/event-handler";
import * as Matter from "matter-js";
export declare class PhysicsDemo extends BaseDemo {
    camera: ChartCamera;
    circles: [CircleInstance, Matter.Body][];
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
    engine: Matter.Engine;
    ground: Matter.Body;
    animationTimer: number;
    buildConsole(gui: datGUI.GUI): void;
    destroy(): void;
    getEventManagers(defaultController: BasicCameraController, _defaultCamera: ChartCamera): (BasicCameraController | EventHandler)[];
    getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null;
    getLayers(): LayerInitializer[];
    init(): Promise<void>;
    makeCircle(bounds: Bounds): [CircleInstance, Matter.Body];
    removeCircle(): void;
}
