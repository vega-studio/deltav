import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Bounds, Camera2D, CircleInstance, InstanceProvider, LabelInstance } from "src";
import { BaseDemo } from "../../common/base-demo";
import * as Matter from "matter-js";
export declare class PhysicsDemo extends BaseDemo {
    circles: [CircleInstance, Matter.Body][];
    shakeTimer: number;
    providers: {
        circles: InstanceProvider<CircleInstance>;
        labels: InstanceProvider<LabelInstance>;
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
    makeSurface(container: HTMLElement): BasicSurface<{
        circles: InstanceProvider<CircleInstance>;
        labels: InstanceProvider<LabelInstance>;
    }, {
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
    }, {}>;
    init(): Promise<void>;
    makeCircle(bounds: Bounds<any>): [CircleInstance, Matter.Body];
    removeCircle(): void;
}
