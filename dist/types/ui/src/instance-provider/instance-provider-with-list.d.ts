import { Instance } from "./instance.js";
import { InstanceProvider } from "./instance-provider.js";
/**
 * A less performant version of the instance provider that provides a tracked
 * list of all instances in the provider. This is very convenient when you need
 * to regularly loop over all existing instances, but always note: this will
 * perform slower than specialized uses of a raw InstanceProvider.
 */
export declare class InstanceProviderWithList<TInstance extends Instance> extends InstanceProvider<TInstance> {
    /**
     * List that tracks all instances. This list should not be manipulated
     * directly. But the instances within can be edited.
     */
    get instances(): readonly TInstance[];
    private _instances;
    constructor(instances?: TInstance[]);
    add(instance: TInstance): TInstance;
    clear(): void;
    remove(instance: {
        uid: number;
    }): boolean;
    destroy(): void;
}
