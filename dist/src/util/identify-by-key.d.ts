export interface IdentifyByKeyOptions {
    key: string;
}
export declare class IdentifyByKey {
    private _key;
    readonly id: string;
    readonly key: string;
    constructor(options: IdentifyByKeyOptions);
}
export declare class IdentifiableData<T> extends IdentifyByKey {
    data: T;
    constructor(options: IdentifyByKeyOptions & {
        data: T;
    });
}
