export interface IdentifyByKeyOptions {
    key: string;
}
export declare class IdentifyByKey {
    private key;
    readonly id: string;
    constructor(options: IdentifyByKeyOptions);
}
