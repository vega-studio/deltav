import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Camera2D, CircleInstance, InstanceProvider, Size, Vec2 } from "src";
import { SimpleEventHandler } from "../../../src/event-management/simple-event-handler";
import { BaseDemo } from "../../common/base-demo";
export declare class BasicDemo extends BaseDemo {
    circles: CircleInstance[];
    screen: Size;
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
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
        clickScreen: SimpleEventHandler;
    }, {}>;
    init(): Promise<void>;
    makeCircle(): void;
    moveToLocation(location: Vec2): Promise<void>;
    removeCircle(): void;
    shakeCircles(): void;
}
