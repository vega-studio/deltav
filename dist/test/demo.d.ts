import * as datGUI from "dat.gui";
import { BaseDemo } from "./common/base-demo";
import { Surface } from "./gl/surface";
export interface IDemoOptions {
    container: HTMLElement;
}
export declare class Demo {
    currentDemo: BaseDemo;
    gui: datGUI.GUI;
    options: IDemoOptions;
    surface: Surface;
    guiStore: {
        currentDemo: string;
    };
    private resizeTimer;
    constructor(options: IDemoOptions);
    buildConsole(): void;
    changeDemo(demoKey: string): Promise<void>;
    destroy(): void;
    init(): Promise<void>;
    resize: () => void;
}
