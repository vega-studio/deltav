import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, Omit, ShaderInjectionTarget } from "../../types";
export declare type ShaderModuleUnitOptions = Omit<Partial<ShaderModuleUnit>, "lock">;
export declare class ShaderModuleUnit {
    private _isLocked;
    private _content;
    private _compatibility;
    private _moduleId;
    private _dependents;
    content: string;
    compatibility: ShaderInjectionTarget;
    dependents: string[] | null;
    instanceAttributes?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IInstanceAttribute<T>[];
    isLocked(): boolean;
    isFinal?: boolean;
    moduleId: string;
    uniforms?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IUniform[];
    vertexAttributes?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IVertexAttribute[];
    constructor(options: ShaderModuleUnitOptions);
    applyAnalyzedContent(content: string): void;
    lock(): void;
}
