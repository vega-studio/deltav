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
export declare function shaderTemplate(shader: string, options: {
    [key: string]: string;
}, required?: IShaderTemplateRequirements): IShaderTemplateResults;
