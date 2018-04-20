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
    private key;
    /** READONLY id of the object. */
    readonly id: string;
    constructor(options: IdentifyByKeyOptions);
}
