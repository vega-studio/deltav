export interface IResourcePool<T> {
    firstAlloc: number;
    create(): T;
    destroy(item: T): void;
}
/**
 * This is a resource pool manager that aids in utilizing resources without ever
 * deallocating them. This is most useful in working with basic structured items
 * like Matrices and Vectors.
 */
export declare class ResourcePool<T> {
    private index;
    private pool;
    private marker;
    private options;
    constructor(options: IResourcePool<T>);
    destroy(): void;
    retrieve(): T;
    replace(item: T): void;
}
