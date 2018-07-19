import { Identifiable, IEasingProps } from "../types";
export interface IInstanceOptions {
    active?: boolean;
    id: string;
}
export declare class Instance implements Identifiable {
    private _id;
    active: boolean;
    private _easing;
    destroy(): void;
    readonly easing: Map<number, IEasingProps>;
    readonly id: string;
    constructor(options: IInstanceOptions);
}
