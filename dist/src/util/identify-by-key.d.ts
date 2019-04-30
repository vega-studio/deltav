export interface IdentifyByKeyOptions {
    key: string;
}
export declare class IdentifyByKey {
    private _key;
    readonly id: string;
    readonly key: string;
    constructor(options: IdentifyByKeyOptions);
}
