import { Omit, ShaderInjectionTarget } from "../../types";
export declare type ShaderModuleUnitOptions = Omit<Partial<ShaderModuleUnit>, "lock">;
export declare class ShaderModuleUnit {
    private _isLocked;
    private _content;
    private _compatibility;
    private _moduleId;
    content: string;
    compatibility: ShaderInjectionTarget;
    isFinal?: boolean;
    moduleId: string;
    constructor(options: ShaderModuleUnitOptions);
    lock(): void;
}
