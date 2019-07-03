import { BaseDemo } from "./common/base-demo";
interface IDemoCtor {
    new (): BaseDemo;
}
export declare const demos: Map<string, IDemoCtor>;
export declare const startDemoKey: string;
export declare const demoKeys: string[];
export {};
