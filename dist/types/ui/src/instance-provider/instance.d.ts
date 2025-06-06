import { IEasingControl, IEasingProps } from "../types.js";
import { InstanceProvider } from "./instance-provider.js";
export interface IInstanceOptions {
    /** The instance can be declared with an initial active state */
    active?: boolean;
    /** An instance must be declared with an identifier */
    id?: string;
}
export declare class Instance {
    static get newUID(): number;
    /** This indicates when the instance is active / rendering */
    get active(): boolean;
    set active(val: boolean);
    _active: boolean;
    /** The property changes on the instance */
    changes: {
        [key: number]: number;
    };
    /**
     * This is a lookup that provides a means to retrieve the id of an easing type
     * currently available to the instance. This is populated when the instance
     * becomes a part of a layer with easing attributes.
     *
     * This property is to NOT be mutated except by the system.
     */
    easingId: {
        [key: string]: number;
    } | undefined;
    /**
     * This is an internal easing object to track properties for automated easing
     */
    easing?: Map<number, IEasingProps>;
    /** This is the observer of the Instance's observable properties */
    private _observer;
    /** This is where observables store their data for the instance */
    observableStorage: any[];
    /**
     * A numerical look up for the instance. Numerical identifiers run faster than
     * objects or strings
     */
    private _uid;
    /**
     * This is the flag indicating this instance was reactivated. When true, this
     * performs a full update of all properties on the instance
     */
    reactivate: boolean;
    /**
     * Retrieves a method for disposing the link between observables and observer.
     */
    get observableDisposer(): () => void;
    /**
     * Retrieves the observer of the observables.
     */
    get observer(): InstanceProvider<this> | null;
    /**
     * Applies an observer for changes to the observables.
     */
    set observer(val: InstanceProvider<this> | null);
    /**
     * This attempts to get the easing object for this instance for a given
     * attribute that it MIGHT be associated with.
     *
     * When an instance is added to a layer and the layer has attributes with
     * easing applied to them, the instance gains easing values for the attributes
     * in the layer with applied easing.
     *
     * You can access the easing values by requesting the attribute's "name"
     * property value using this method.
     *
     * There is NO WAY TO GUARANTEE this value is set or available, so this method
     * WILL return undefined if you did not use the correct name, or no such value
     * exists, or the layer decided to not make the attribute animateable.
     *
     * Thus ALWAYS check the returned value to ensure it is defined before
     * attempting to use it's results.
     *
     * PERFORMANCE: You can probably get much better performance NOT using this to
     * manipulate the easing object directly. The system is designed to
     * automatically animate an item from it's current rendered location to the
     * next location seamlessly thus accounting for most situations. This method
     * is provided to commit much more complex start, duration, and delay
     * animations within a given frame to prevent the need for complicated
     * setTimeout patterns.
     *
     * This CAN be faster than the default behavior if it avoids causing
     * complicated easing computations to determine where the rendering should be
     * at the moment (complicated cpu methods within the IAutoEasingMethod used).
     */
    getEasing(attributeName: string): IEasingControl | undefined;
    /**
     * Get the auto generated ID of this instance
     */
    get uid(): number;
    /**
     * This method is utilized internally to indicate when requested resources are
     * ready. If you have a property that will be requesting a resource, you
     * should implement this method to cause a trigger for the property to
     * activate such that the property will update it's buffer.
     */
    resourceTrigger(): void;
    constructor(options?: IInstanceOptions);
}
