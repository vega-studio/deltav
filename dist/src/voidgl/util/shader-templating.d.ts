export interface IShaderTemplateResults {
    /** This is the resulting shader string generated from the templating */
    shader: string;
    /** This is the template options provided by the shader. {option: num occurrences} */
    shaderProvidedOptions: Map<string, number>;
    /**
     * This is the template options provided by the shader that were not resolved by the options parameter
     * {option: num occurrences}
     */
    unresolvedShaderOptions: Map<string, number>;
    /** This is the options provided to the template that did not get resolved by the shader {option: 1} */
    unresolvedProvidedOptions: Map<string, number>;
    /** This is the list of options that DID get resolved by the options provided {option: num occurrences} */
    resolvedShaderOptions: Map<string, number>;
}
export interface IShaderTemplateRequirements {
    /** A string identifier to make it easier to identify which shader template failed requirements */
    name: string;
    /** The options that must be present within both provided options AND within the template */
    values: string[];
}
export declare function shaderTemplate(shader: string, options: {
    [key: string]: string;
}, required?: IShaderTemplateRequirements): IShaderTemplateResults;
