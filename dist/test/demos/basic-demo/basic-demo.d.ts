import * as datGUI from "dat.gui";
import { BasicCameraController, BasicSurface, ChartCamera, CircleInstance, InstanceProvider, Vec2 } from "src";
import { BaseDemo } from "../../common/base-demo";
import { EventHandler } from "../../common/event-handler";
export declare class BasicDemo extends BaseDemo {
    circles: CircleInstance[];
    shakeTimer: number;
    providers: {
        circles: InstanceProvider<CircleInstance>;
    };
    parameters: {
        count: number;
        radius: number;
        moveAtOnce: number;
        addAtOnce: number;
        previous: {
            count: number;
        };
    };
    currentLocation: Vec2;
    buildConsole(gui: datGUI.GUI): void;
    destroy(): void;
    makeSurface(container: HTMLElement): BasicSurface<{
        circles: InstanceProvider<CircleInstance>;
    }, {
        main: ChartCamera;
    }, {
        main: BasicCameraController;
        clickScreen: EventHandler;
    }, {}>;
    init(): Promise<void>;
    makeCircle(): void;
    moveToLocation(location: Vec2): Promise<void>;
    removeCircle(): void;
    shakeCircles(): void;
}
