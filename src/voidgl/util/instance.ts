import { observable } from '../instance-provider';
import { Identifiable } from '../types';

let instanceUID = 0;

export interface IInstanceOptions {
  /** The instance can be declared with an initial active state */
  active?: boolean;
  /** An instance must be declared with an identifier */
  id?: string;
}

export class Instance implements Identifiable {
  static get newUID() { return (instanceUID = (++instanceUID) % 0xFFFFFF); }

  /** A numerical look up for the instance. Numerical identifiers run faster than objects or strings */
  private _uid = Instance.newUID;
  /** Internal, non-changeable id */
  private _id: string;
  /** This indicates when the instance is active / rendering */
  @observable active: boolean;

  /**
   * The system will call this on the instance when it believes the instance may be
   * harboring resources that are not released.
   */
  destroy() {
    // Generally a No-op
  }

  get id() {
    return this._id;
  }

  get uid() {
    return this._uid;
  }

  constructor(options: IInstanceOptions) {
    this._id = options.id;
    this.active = options.active;
  }
}
