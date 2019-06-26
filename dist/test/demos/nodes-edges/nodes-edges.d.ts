import * as datGUI from "dat.gui";
import { ArcInstance, BasicCameraController, BasicSurface, ChartCamera, CircleInstance, EdgeInstance, InstanceProvider, IPickInfo, LabelInstance, RectangleInstance, ScaleMode, Size, Vec4 } from "src";
import { BaseDemo } from "../../common/base-demo";
export declare function wait(t: number): Promise<{}>;
export declare class NodesEdges extends BaseDemo {
    circles: CircleInstance[];
    edges: EdgeInstance[];
    labels: LabelInstance[];
    rectangles: RectangleInstance[];
    lblToRect: Map<LabelInstance, RectangleInstance>;
    center: CircleInstance;
    boundsView: RectangleInstance;
    providers: {
        arcs: InstanceProvider<ArcInstance>;
        circles: InstanceProvider<CircleInstance>;
        edges: InstanceProvider<EdgeInstance>;
        rectangles: InstanceProvider<RectangleInstance>;
        labels: InstanceProvider<LabelInstance>;
    };
    arcs: ArcInstance[];
    parameters: {
        count: number;
        fontSize: number;
        scaleMode: ScaleMode;
        circleRadius: number;
        nodeRadius: number;
        previous: {
            count: number;
        };
    };
    viewSize: Size;
    buildConsole(gui: datGUI.GUI): void;
    adjustBounds(): void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (_info: IPickInfo<CircleInstance>) => void;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    makeSurface(container: HTMLElement): BasicSurface<{
        arcs: InstanceProvider<ArcInstance>;
        circles: InstanceProvider<CircleInstance>;
        edges: InstanceProvider<EdgeInstance>;
        rectangles: InstanceProvider<RectangleInstance>;
        labels: InstanceProvider<LabelInstance>;
    }, {
        main: ChartCamera;
    }, {
        main: BasicCameraController;
    }, {
        font: import("../../../src").IFontResourceOptions;
    }>;
    init(): Promise<void>;
    labelReady: (label: LabelInstance) => void;
    makeNode(preload?: boolean, txt?: string): void;
    makeColor(i: number): Vec4;
    layout(): void;
    removeNode(): void;
    resize(): void;
}
