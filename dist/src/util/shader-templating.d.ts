export interface IShaderTemplateResults {
    shader: string;
    shaderProvidedOptions: Map<string, number>;
    unresolvedShaderOptions: Map<string, number>;
    unresolvedProvidedOptions: Map<string, number>;
    resolvedShaderOptions: Map<string, number>;
}
export interface IShaderTemplateRequirements {
    name: string;
    values: string[];
}
export interface IShaderTemplateOptions {
    onError?(msg: string): void;
    onToken?(token: string, replace: string): string;
    options: {
        [key: string]: string;
    };
    required?: IShaderTemplateRequirements;
    shader: string;
}
export declare function shaderTemplate(templateOptions: IShaderTemplateOptions): IShaderTemplateResults;
