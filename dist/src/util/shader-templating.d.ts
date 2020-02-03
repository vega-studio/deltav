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
export interface IShaderTemplateOptions {
    /** Callback for 'required' errors being emitted */
    onError?(msg: string): void;
    /** Callback that allows overrides for token replacement. Provides the token found and the suggested replacement for it */
    onToken?(token: string, replace: string): string;
    /**
     * If this is provided, the shader templater will search out the void main method of the shader and provide the body
     * contents of that main() method. You can edit those body contents and return the edited value to replace the body
     * with those contents.
     *
     * If the body in the callback is null, then that means a main() method could NOT be determined.
     */
    onMain?(body: string | null): string | {
        main: string;
        header: string;
    };
    /** This is a key value pair the template uses to match tokens found to replacement values */
    options: {
        [key: string]: string;
    };
    /** This is used to indicate which tokens are required both within the shader AND within the 'options' */
    required?: IShaderTemplateRequirements;
    /** This is the shader written with templating information */
    shader: string;
}
/**
 * This is a method that aids in making shaders a bit more dynamic with simple string replacement based on tokens written
 * into the shader. Tokens in the shader will appear as ${token} and will either be ignored by this method and thus removed
 * or will be replaced with a provided value.
 *
 * This method will give feedback on the replacements taking place and simplify the process of detecting errors within the process.
 */
export declare function shaderTemplate(templateOptions: IShaderTemplateOptions): IShaderTemplateResults;
