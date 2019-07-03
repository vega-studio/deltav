import * as datGUI from "dat.gui";
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider, IPickInfo, SimpleEventHandler } from "../../../src";
import { BaseDemo } from "../../common/base-demo";
export declare class TouchDemo extends BaseDemo {
    providers: {
        circles: InstanceProvider<CircleInstance>;
        center: InstanceProvider<CircleInstance>;
        TR: InstanceProvider<CircleInstance>;
        TL: InstanceProvider<CircleInstance>;
        BL: InstanceProvider<CircleInstance>;
        BR: InstanceProvider<CircleInstance>;
    };
    touchCircles: Map<string | number, CircleInstance>;
    multitouchIndicator: CircleInstance;
    buildConsole(_gui: datGUI.GUI): void;
    handleTestDotOver: (info: IPickInfo<CircleInstance>) => void;
    handleTestDotOut: (info: IPickInfo<CircleInstance>) => void;
    makeSurface(container: HTMLElement): BasicSurface<{
        circles: InstanceProvider<CircleInstance>;
        center: InstanceProvider<CircleInstance>;
        TR: InstanceProvider<CircleInstance>;
        TL: InstanceProvider<CircleInstance>;
        BL: InstanceProvider<CircleInstance>;
        BR: InstanceProvider<CircleInstance>;
    }, {
        main: Camera2D;
    }, {
        main: SimpleEventHandler;
    }, {}>;
    init(): Promise<void>;
}
