import { Identifiable, IEasingProps } from '../types';
export interface IInstanceOptions {
    /** The instance can be declared with an initial active state */
    active?: boolean;
    /** An instance must be declared with an identifier */
    id: string;
}
export declare class Instance implements Identifiable {
    /** Internal, non-changeable id */
    private _id;
    /** This indicates when the instance is active / rendering */
    active: boolean;
    /** This is an internal easing object to track properties for automated easing */
    private _easing;
    /**
     * The system will call this on the instance when it believes the instance may be
     * harboring resources that are not released.
     */
    destroy(): void;
    readonly easing: Map<number, IEasingProps>;
    readonly id: string;
    constructor(options: IInstanceOptions);
}
