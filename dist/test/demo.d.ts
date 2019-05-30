import * as datGUI from "dat.gui";
import { BaseDemo } from "./common/base-demo";
export interface IDemoOptions {
    container: HTMLElement;
}
export declare class Demo {
    currentDemo: BaseDemo;
    gui: datGUI.GUI;
    options: IDemoOptions;
    guiStore: {
        currentDemo: string;
    };
    constructor(options: IDemoOptions);
    buildConsole(): void;
    changeDemo(demoKey: string): Promise<void>;
    destroy(): void;
    init(): Promise<void>;
}
