export interface ITemplateResults {
    /** This is the resulting template string generated from the templating */
    template: string;
    /** This is the template options provided by the template. {option: num occurrences} */
    templateProvidedOptions: Map<string, number>;
    /**
     * This is the template options provided by the template that were not resolved by the options parameter
     * {option: num occurrences}
     */
    unresolvedTemplateOptions: Map<string, number>;
    /** This is the options provided to the template that did not get resolved by the template {option: 1} */
    unresolvedProvidedOptions: Map<string, number>;
    /** This is the list of options that DID get resolved by the options provided {option: num occurrences} */
    resolvedTemplateOptions: Map<string, number>;
}
export interface ITemplateRequirements {
    /** A string identifier to make it easier to identify which template template failed requirements */
    name: string;
    /** The options that must be present within both provided options AND within the template */
    values: string[];
}
export interface ITemplateOptions {
    /** Double curly brackets for template items instead of one */
    doubleCurlyBrackets?: boolean;
    /** This is a key value pair the template uses to match tokens found to replacement values */
    options: {
        [key: string]: string;
    };
    /** This is used to indicate which tokens are required both within the template AND within the 'options' */
    required?: ITemplateRequirements;
    /** This is the template written with templating information */
    template: string;
    /** Callback for 'required' errors being emitted */
    onError?(msg: string): void;
    /**
     * Callback that allows overrides for token replacement. Provides the token found and the
     * suggested replacement for it
     */
    onToken?(token: string, replace: string): string;
}
/**
 * This is a method that aids in making templates a bit more dynamic with simple string replacement based on
 * tokens written into the template. Tokens in the template will appear as ${token} and will either be ignored by this
 * method and thus removed or will be replaced with a provided value.
 *
 * This method will give feedback on the replacements taking place and simplify the process of detecting errors
 * within the process.
 */
export declare function template({ template, doubleCurlyBrackets, options, required, onError, onToken, }: ITemplateOptions): ITemplateResults;
