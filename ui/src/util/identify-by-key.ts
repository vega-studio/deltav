export interface IdentifyByKeyOptions {
  /** The identifier of the object */
  key: string;
}

/**
 * This is an object that specifically is generated with a 'key' option that can never
 * be modified on the object and is identified henceforth with the key applied as the
 * 'id' of the object.
 */
export class IdentifyByKey {
  /** Internal key held by the object */
  private _key: string;

  /** READONLY id of the object. */
  get id() {
    return this._key;
  }

  /** READONLY key of the object */
  get key() {
    return this._key;
  }

  constructor(options: IdentifyByKeyOptions) {
    this._key = options.key;
  }
}

export class IdentifiableData<T> extends IdentifyByKey {
  data: T;

  constructor(options: IdentifyByKeyOptions & { data: T }) {
    super(options);
    this.data = options.data;
  }
}
