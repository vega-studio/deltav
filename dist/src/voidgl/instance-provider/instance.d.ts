import { Identifiable, IEasingControl, IEasingProps } from "../types";
import { InstanceProvider } from "./instance-provider";
export interface IInstanceOptions {
    active?: boolean;
    id?: string;
}
export declare class Instance implements Identifiable {
    static readonly newUID: number;
    active: boolean;
    changes: {
        [key: number]: number;
    };
    property: {
        [key: string]: number;
    };
    easingId: {
        [key: string]: number;
    } | undefined;
    private _easing;
    private _id;
    private _observer;
    observableStorage: any[];
    private _uid;
    readonly observableDisposer: () => void;
    observer: InstanceProvider<this> | null;
    clearEasing(): void;
    readonly easing: Map<number, IEasingProps>;
    getEasing(attributeName: string): IEasingControl | undefined;
    readonly id: string;
    readonly uid: number;
    resourceTrigger(): void;
    constructor(options: IInstanceOptions);
}
