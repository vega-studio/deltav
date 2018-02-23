import { observable } from 'mobx';
import { Identifiable } from '../types';

export interface IInstanceOptions {
  /** The instance can be declared with an initial active state */
  active?: boolean;
  /** An instance must be declared with an identifier */
  id: string;
}

export class Instance implements Identifiable {
  /** Internal, non-changeable id */
  private _id: string;
  /** This indicates when the instance is active / rendering */
  @observable active: boolean;

  get id() {
    return this._id;
  }

  constructor(options: IInstanceOptions) {
    this._id = options.id;
    this.active = options.active;
  }
}
