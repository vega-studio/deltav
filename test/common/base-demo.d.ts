import * as datGUI from "dat.gui";
import { BaseResourceOptions, BasicSurface, Camera2D, EventManager, IBasicSurfaceOptions, Instance, InstanceProvider, Lookup, Omit } from "src";
export declare type DemoPipeline<T extends Lookup<InstanceProvider<Instance>>, U extends Lookup<Camera2D>, V extends Lookup<EventManager>, W extends Lookup<BaseResourceOptions>> = Omit<IBasicSurfaceOptions<T, U, V, W>, "container" | "onNoWebGL" | "handlesWheelEvents" | "rendererOptions">;
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
    abstract init(): Promise<void>;
    makeInterval(f: Function, time: number): number;
    refreshDemo(): void;
    resize(): void;
    setSurface(surface: ReturnType<this["makeSurface"]>): void;
}
