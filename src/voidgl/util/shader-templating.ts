export interface IShaderTemplateResults {
  /** This is the resulting shader string generated from the templating */
  shader: string;
  /** This is the template options provided by the shader. {option: num occurrences} */
  shaderProvidedOptions: Map<string, number>,
  /**
   * This is the template options provided by the shader that were not resolved by the options parameter
   * {option: num occurrences}
   */
  unresolvedShaderOptions: Map<string, number>,
  /** This is the options provided to the template that did not get resolved by the shader {option: 1} */
  unresolvedProvidedOptions: Map<string, number>,
  /** This is the list of options that DID get resolved by the options provided {option: num occurrences} */
  resolvedShaderOptions: Map<string, number>,
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
  /** This is a key value pair the template uses to match tokens found to replacement values */
  options: {[key: string]: string};
  /** This is used to indicate which tokens are required both within the shader AND within the 'options' */
  required?: IShaderTemplateRequirements;
  /** THis is the shader written with templating information */
  shader: string;
}

/**
 * This is a method that aids in making shaders a bit more dynamic with simple string replacement based on tokens written
 * into the shader. Tokens in the shader will appear as ${token} and will either be ignored by this method and thus removed
 * or will be replaced with a provided value.
 *
 * This method will give feedback on the replacements taking place and simplify the process of detecting errors within the process.
 */
export function shaderTemplate(templateOptions: IShaderTemplateOptions): IShaderTemplateResults {
  const { shader, options, required, onError, onToken } = templateOptions;
  const matched = new Map<string, number>();
  const noValueProvided = new Map<string, number>();
  const notFound = new Map<string, number>();
  const shaderOptions = new Map<string, number>();

  const shaderResults = shader.replace(/\$\{(\w+)\}/g, (x: string, match: string) => {
    let replace = '';
    shaderOptions.set(match, (shaderOptions.get(match) || 0) + 1);

    if (match in options) {
      matched.set(match, (matched.get(match) || 0) + 1);
      replace = options[match];
    }

    else {
      noValueProvided.set(match, (noValueProvided.get(match) || 0) + 1);
    }

    if (onToken) {
      replace = onToken(match, replace);
    }

    return replace;
  });

  Object.keys(options).forEach(option => {
    if (!matched.get(option)) {
      notFound.set(option, (notFound.get(option) || 0) + 1);
    }
  });

  // Provide metrics
  const results = {
    resolvedShaderOptions: matched,
    shader: shaderResults,
    shaderProvidedOptions: shaderOptions,
    unresolvedProvidedOptions: notFound,
    unresolvedShaderOptions: noValueProvided,
  };

  if (required) {
    // This will ensure that BOTH the parameter input AND the shader provided the required options.
    required.values.forEach(require => {
      if (results.unresolvedProvidedOptions.get(require)) {
        const msg = `${required.name}: Could not resolve all the required inputs. Input: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      }

      else if (results.unresolvedShaderOptions.get(require)) {
        const msg = `${required.name}: A required option was not provided in the options parameter. Option: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      }

      else if (!results.resolvedShaderOptions.get(require)) {
        const msg = `${required.name}: A required option was not provided in the options parameter. Option: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      }
    });
  }

  return results;
}
