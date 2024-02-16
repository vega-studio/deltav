import { Instance } from "./instance";
import { InstanceProvider } from "./instance-provider";

/**
 * A less performant version of the instance provider that provides a tracked
 * list of all instances in the provider. This is very convenient when you need
 * to regularly loop over all existing instances, but always note: this will
 * perform slower than specialized uses of a raw InstanceProvider.
 */
export class InstanceProviderWithList<
  TInstance extends Instance,
> extends InstanceProvider<TInstance> {
  /**
   * List that tracks all instances. This list should not be manipulated
   * directly. But the instances within can be edited.
   */
  get instances(): ReadonlyArray<TInstance> {
    return this._instances;
  }
  private _instances: TInstance[] = [];

  constructor(instances?: TInstance[]) {
    super(instances);
  }

  add(instance: TInstance): TInstance {
    this._instances.push(instance);
    return super.add(instance);
  }

  clear() {
    this._instances.length = 0;
    super.clear();
  }

  remove(instance: { uid: number }): boolean {
    const index = this._instances.findIndex((i) => i.uid === instance.uid);
    if (index !== -1) {
      this._instances.splice(index, 1);
    }
    return super.remove(instance);
  }

  destroy() {
    this._instances.length = 0;
    super.destroy();
  }
}
