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
  onMain?(body: string | null): string;

  /** This is a key value pair the template uses to match tokens found to replacement values */
  options: { [key: string]: string };
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
export function shaderTemplate(
  templateOptions: IShaderTemplateOptions
): IShaderTemplateResults {
  const {
    shader,
    options,
    required,
    onError,
    onToken,
    onMain
  } = templateOptions;
  const matched = new Map<string, number>();
  const noValueProvided = new Map<string, number>();
  const notFound = new Map<string, number>();
  const shaderOptions = new Map<string, number>();

  const shaderResults = shader.replace(
    /\$\{([^\}]*)\}/g,
    (_x: string, match: string) => {
      let replace = "";
      shaderOptions.set(match, (shaderOptions.get(match) || 0) + 1);

      if (match in options) {
        matched.set(match, (matched.get(match) || 0) + 1);
        replace = options[match];
      } else {
        noValueProvided.set(match, (noValueProvided.get(match) || 0) + 1);
      }

      if (onToken) {
        replace = onToken(match, replace);
      }

      return replace;
    }
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
    unresolvedShaderOptions: noValueProvided
  };

  if (required) {
    // This will ensure that BOTH the parameter input AND the shader provided the required options.
    required.values.forEach(require => {
      if (results.unresolvedProvidedOptions.get(require)) {
        const msg = `${
          required.name
        }: Could not resolve all the required inputs. Input: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      } else if (results.unresolvedShaderOptions.get(require)) {
        const msg = `${
          required.name
        }: A required option was not provided in the options parameter. Option: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      } else if (!results.resolvedShaderOptions.get(require)) {
        const msg = `${
          required.name
        }: A required option was not provided in the options parameter. Option: ${require}`;
        if (onError) onError(msg);
        else console.error(msg);
      }
    });
  }
  // If onMain is specified, then the caller is wanting to manipulate the body of the main method of the shader
  if (onMain) {
    const shader = results.shader;
    // Use this regex to find the beginning of the main method up to it's opening bracket.
    const found = shader.match(
      /void((.+)|\s)(main(\s+)\(\)|main\(\))(((.+)(\s*)\{)|(\s*)\{)/gm
    );
    if (found && found.length > 0) {
      const start = shader.indexOf(found[0]);
      // Validate we found something useful
      if (start < 0) onMain(null);
      // At this point, we can take the shader and get a string that starts with the body of the void main() method.
      else {
        const bodyStart = shader.substr(start + found[0].length);
        // We now must count valid context brackets till we find a bracket that would close the context of the main
        // body.
        let multilineCommentCount = 0;
        let singleLineCommentCount = 0;
        let openBracket = 1;
        let closeBracket = 0;
        let endBody = -1;

        // When openBracket === close bracket, we have the location of the end of the body of the main method
        for (let i = 0, iMax = bodyStart.length; i < iMax; ++i) {
          const char = bodyStart[i];
          const nextChar = bodyStart[i + 1];

          // Analyze each character for comments and valid bracket contexts
          switch (char) {
            case "/":
              switch (nextChar) {
                case "*":
                  multilineCommentCount++;
                  i++;
                  break;

                case "/":
                  singleLineCommentCount++;
                  i++;
                  break;
              }
              break;

            case "*":
              if (nextChar === "/") {
                if (multilineCommentCount > 0) {
                  multilineCommentCount--;
                  i++;
                }
              }
              break;

            case "\n":
            case "\r":
              if (nextChar === "\n") {
                i++;
              }
              if (singleLineCommentCount > 0) {
                singleLineCommentCount--;
              }
              break;

            case "{":
              if (singleLineCommentCount === 0 && multilineCommentCount === 0) {
                openBracket++;
              }
              break;

            case "}":
              if (singleLineCommentCount === 0 && multilineCommentCount === 0) {
                closeBracket++;
              }

              if (openBracket === closeBracket) {
                endBody = i;
              }
              break;
          }

          // If end body is detected, then we stop looping
          if (endBody !== -1) {
            break;
          }
        }

        if (endBody !== -1) {
          const body = bodyStart.substr(0, endBody);
          const modifiedBody = onMain(body);

          results.shader =
            shader.substr(0, start + found[0].length) +
            modifiedBody +
            shader.substr(start + found[0].length + endBody);
        } else {
          onMain(null);
        }
      }
    }
  }

  return results;
}
