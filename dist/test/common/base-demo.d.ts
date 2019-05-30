import * as datGUI from "dat.gui";
import { BaseResourceOptions, BasicSurface, Bounds, ChartCamera, EventManager, IBasicSurfaceOptions, Instance, InstanceProvider, Lookup, Omit, View } from "src";
export declare type DemoPipeline<T extends Lookup<InstanceProvider<Instance>>, U extends Lookup<ChartCamera>, V extends Lookup<EventManager>, W extends Lookup<BaseResourceOptions>> = Omit<IBasicSurfaceOptions<T, U, V, W>, "container" | "onNoWebGL" | "handlesWheelEvents" | "rendererOptions">;
export interface ITest<T> {
    method(): T;
}
export declare abstract class BaseDemo {
    private timers;
    private _isDestroyed;
    readonly isDestroyed: boolean;
    surface?: ReturnType<this["makeSurface"]>;
    abstract buildConsole(gui: datGUI.GUI): void;
    destroy(): void;
    abstract makeSurface(container: HTMLElement): BasicSurface<any, any, any, any>;
    getViewScreenBounds(viewId?: string): Promise<Bounds<View> | null>;
    abstract init(): Promise<void>;
    makeInterval(f: Function, time: number): number;
    refreshDemo(): void;
    resize(): void;
    setSurface(surface: ReturnType<this["makeSurface"]>): void;
}
