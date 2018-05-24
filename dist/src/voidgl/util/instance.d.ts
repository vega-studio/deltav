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
    /**
     * The system will call this on the instance when it believes the instance may be
     * harboring resources that are not released.
     */
    destroy(): void;
    readonly id: string;
    readonly uid: number;
    constructor(options: IInstanceOptions);
}
