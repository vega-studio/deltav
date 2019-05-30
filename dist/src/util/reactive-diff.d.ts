import { IdentifiableById } from "../types";
export declare type ReactiveDiffObject<U> = {
    key: string | number;
    parent?: U;
};
export interface IReactiveDiffOptions<U, T extends ReactiveDiffObject<U>> {
    buildItem(intiializer: T): Promise<U | null>;
    destroyItem(intiializer: T, item: U): Promise<boolean | null>;
    updateItem(initializer: T, item: U): Promise<void>;
}
export declare class ReactiveDiff<U extends IdentifiableById | null, T extends ReactiveDiffObject<U>> {
    private options;
    private willDispose;
    private keyToItem;
    private keyToInitializer;
    private currentInitalizerIndex;
    private currentInitializers;
    private _items;
    private currentInitializer?;
    private currentItem?;
    private deferredInlining?;
    readonly items: U[];
    constructor(options: IReactiveDiffOptions<U, T>);
    destroy(): Promise<void>;
    diff(intializers: T[]): Promise<void>;
    getByKey(key: string): U | undefined;
    private inlineDeferred;
    private inlineImmediate;
    inline: (newInitializers: T[]) => void;
    rebuild(): Promise<void>;
}
