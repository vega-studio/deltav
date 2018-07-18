import { IBufferLocation } from '../surface/buffer-management';
import { Identifiable, IEasingProps } from '../types';
import { InstanceProvider } from './instance-provider';
export interface IInstanceOptions {
    /** The instance can be declared with an initial active state */
    active?: boolean;
    /** An instance must be declared with an identifier */
    id?: string;
}
export declare class Instance implements Identifiable {
    static readonly newUID: number;
    /** This indicates when the instance is active / rendering */
    active: boolean;
    /** This is a mapping of an instance's observable properties to their associated Buffer Mapping */
    private _attributeMapping;
    /** This is an internal easing object to track properties for automated easing */
    private _easing;
    /** Internal, non-changeable id */
    private _id;
    /** This is the observer of the Instance's observable properties */
    private _observer;
    /** This is where observables store their data for the instance */
    observableStorage: any[];
    /** A numerical look up for the instance. Numerical identifiers run faster than objects or strings */
    private _uid;
    /**
     * The system will call this on the instance when it believes the instance may be
     * harboring resources that are not released.
     */
    destroy(): void;
    readonly observableDisposer: () => void;
    observer: InstanceProvider<this> | null;
    readonly attributeMapping: Map<number, IBufferLocation>;
    readonly easing: Map<number, IEasingProps>;
    readonly id: string;
    readonly uid: number;
    /**
     * This method is utilized internally to indicate when requested resources are ready.
     * If you have a property that will be requesting a resource, you should implement this method
     * to cause a trigger for the property to activate such that the property will update it's buffer.
     */
    resourceTrigger(): void;
    constructor(options: IInstanceOptions);
}
