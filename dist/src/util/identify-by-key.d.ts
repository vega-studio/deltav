export interface IdentifyByKeyOptions {
    /** The identifier of the object */
    key: string;
}
/**
 * This is an object that specifically is generated with a 'key' option that can never
 * be modified on the object and is identified henceforth with the key applied as the
 * 'id' of the object.
 */
export declare class IdentifyByKey {
    /** Internal key held by the object */
    private _key;
    /** READONLY id of the object. */
    readonly id: string;
    /** READONLY key of the object */
    readonly key: string;
    constructor(options: IdentifyByKeyOptions);
}
export declare class IdentifiableData<T> extends IdentifyByKey {
    data: T;
    constructor(options: IdentifyByKeyOptions & {
        data: T;
    });
}
