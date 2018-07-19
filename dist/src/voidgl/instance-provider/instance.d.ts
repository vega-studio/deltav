import { Identifiable, IEasingProps } from "../types";
import { InstanceProvider } from "./instance-provider";
export interface IInstanceOptions {
    active?: boolean;
    id?: string;
}
export declare class Instance implements Identifiable {
    static readonly newUID: number;
    active: boolean;
    private _easing;
    private _id;
    private _observer;
    observableStorage: any[];
    private _uid;
    changes: {
        [key: number]: number;
    };
    destroy(): void;
    readonly observableDisposer: () => void;
    observer: InstanceProvider<this> | null;
    readonly easing: Map<number, IEasingProps>;
    readonly id: string;
    readonly uid: number;
    resourceTrigger(): void;
    constructor(options: IInstanceOptions);
}
