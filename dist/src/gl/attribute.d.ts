export declare class Attribute {
    data: Float32Array;
    gl?: {
        bufferId: WebGLBuffer;
        type: number;
        locations?: Map<WebGLProgram, number>;
    };
    readonly isDynamic: boolean;
    private _isDynamic;
    readonly isInstanced: boolean;
    private _isInstanced;
    readonly fullUpdate: boolean;
    private _fullUpdate;
    normalize: boolean;
    readonly needsUpdate: boolean;
    private _needsUpdate;
    size: number;
    updateRange: Attribute["_updateRange"];
    private _updateRange;
    constructor(data: Float32Array, size: number, isDynamic?: boolean, isInstanced?: boolean);
    resolve(): void;
    setDynamic(isDynmaic: boolean): void;
}
