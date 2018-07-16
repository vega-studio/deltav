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

export function shaderTemplate(
  shader: string,
  options: { [key: string]: string },
  required?: IShaderTemplateRequirements,
): IShaderTemplateResults {
  const matched = new Map<string, number>();
  const noValueProvided = new Map<string, number>();
  const notFound = new Map<string, number>();
  const shaderOptions = new Map<string, number>();

  const shaderResults = shader.replace(
    /\$\{(\w+)\}/g,
    (x: string, match: string) => {
      shaderOptions.set(match, (shaderOptions.get(match) || 0) + 1);

      if (match in options) {
        matched.set(match, (matched.get(match) || 0) + 1);
        return options[match];
      }

      noValueProvided.set(match, (noValueProvided.get(match) || 0) + 1);
      return '';
    },
  );

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
        console.error(
          `${required.name}: Could not resolve all the required inputs. Input:`,
          require,
        );
      } else if (results.unresolvedShaderOptions.get(require)) {
        console.error(
          `${
            required.name
          }: A required option was not provided in the options parameter. Option:`,
          require,
        );
      } else if (!results.resolvedShaderOptions.get(require)) {
        console.error(
          `${
            required.name
          }: A required option was not provided in the options parameter. Option:`,
          require,
        );
      }
    });
  }

  return results;
}
