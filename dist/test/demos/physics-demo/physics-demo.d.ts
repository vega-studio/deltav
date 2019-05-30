import * as datGUI from "dat.gui";
import { BasicCameraController, BasicSurface, Bounds, ChartCamera, CircleInstance, InstanceProvider, LabelInstance } from "src";
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
        main: ChartCamera;
    }, {
        main: BasicCameraController;
    }, {}>;
    init(): Promise<void>;
    makeCircle(bounds: Bounds<any>): [CircleInstance, Matter.Body];
    removeCircle(): void;
}
