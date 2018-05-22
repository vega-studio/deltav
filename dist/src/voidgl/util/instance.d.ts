import { Identifiable } from '../types';
export interface IInstanceOptions {
    /** The instance can be declared with an initial active state */
    active?: boolean;
    /** An instance must be declared with an identifier */
    id?: string;
}
export declare class Instance implements Identifiable {
    /** A numerical look up for the instance. Numerical identifiers run faster than objects or strings */
    private _uid;
    /** Internal, non-changeable id */
    private _id;
    /** This indicates when the instance is active / rendering */
    active: boolean;
    readonly id: string;
    readonly uid: number;
    constructor(options: IInstanceOptions);
}
