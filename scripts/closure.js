const fs = require('fs');
const fsExtra = require('fs-extra');
const tsickle = require('tsickle');
const { resolve, join, dirname, normalize, isAbsolute, relative } = require('path');
const ts = require('typescript');

const tslibPath = resolve('node_modules/tslib/tslib.d.ts');
const cachedLibs = new Map();
const cachedLibDir = normalize(dirname(ts.getDefaultLibFilePath({})));

/** Base compiler options to be customized and exposed. */
const baseCompilerOptions = {
  // Down level to ES2015: Angular users must lower "await" statements so that zone can intercept
  // them, so many users do down-level. This allows testing await_transformer.ts.
  target: ts.ScriptTarget.ES2015,
  // Disable searching for @types typings. This prevents TS from looking
  // around for a node_modules directory.
  types: [],
  // Setting the target to ES2015 sets the lib field to ['lib.es6.d.ts'] by
  // default. Override this value to also provide type declarations for BigInt
  // literals.
  lib: ['lib.es6.d.ts', 'lib.esnext.bigint.d.ts'],
  skipDefaultLibCheck: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  strictNullChecks: true,
  noImplicitUseStrict: true,
  allowJs: false,
  importHelpers: true,
  noEmitHelpers: true,
  stripInternal: true,
  baseUrl: '.',
  paths: {
    // The compiler builtin 'tslib' library is looked up by name,
    // so this entry controls which code is used for tslib.
    tslib: [tslibPath],
    src: [resolve("src")]
  },
};

/** The TypeScript compiler options used by the test suite. */
const compilerOptions = {
  ...baseCompilerOptions,
  emitDecoratorMetadata: true,
  jsx: ts.JsxEmit.React,
  // Tests assume that rootDir is always present.
  rootDir: resolve('src'),
};

function assertAbsolute(fileName) {
  if (!isAbsolute(fileName)) {
    throw new Error(`expected ${JSON.stringify(fileName)} to be absolute`);
  }
}

function createSourceCachingHost(sources, tsCompilerOptions = compilerOptions) {
  const host = ts.createCompilerHost(tsCompilerOptions);

  host.getCurrentDirectory = () => {
    console.log('getCurrentDirectory', resolve('./dist/src'));
    return resolve('.');
  };

  host.getSourceFile = (fileName, _languageVersion, _onError) => {
    assertAbsolute(fileName);
    // Normalize path to fix wrong directory separators on Windows which
    // would break the equality check.
    fileName = normalize(fileName);
    if (cachedLibs.has(fileName)) {
      console.log('Cached Source File:', fileName);
      return cachedLibs.get(fileName);
    }

    // Cache files in TypeScript's lib directory.
    if (fileName.startsWith(cachedLibDir)) {
      console.log('Cached Source File:', fileName);
      const sf = ts.createSourceFile(
        fileName,
        fs.readFileSync(fileName, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      );
      cachedLibs.set(fileName, sf);
      return sf;
    }

    if (fileName === tslibPath) {
      console.log('Provided Source File:', fileName);
      return ts.createSourceFile(
        fileName,
        fs.readFileSync(fileName, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      );
    }

    const contents = sources.get(fileName);
    if (contents !== undefined) {
      console.log('Provided Source File:', fileName);
      return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
    }

    console.log('File System Source File:', fileName);
    return ts.createSourceFile(
      fileName,
      fs.readFileSync(fileName, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );
  };

  const originalFileExists = host.fileExists;

  host.fileExists = fileName => {
    assertAbsolute(fileName);

    if (fs.existsSync(fileName)) {
      return true;
    }

    return originalFileExists.call(host, fileName);
  };

  return host;
}

function createProgramAndHost(sources, tsCompilerOptions = compilerOptions) {
  const host = createSourceCachingHost(sources);
  const program = ts.createProgram(Array.from(sources.keys()), tsCompilerOptions, host);
  return { program, host };
}

function emitWithTsickle(
  tsSources, tsConfigOverride = {},
  tsickleHostOverride = {},
  customTransformers
) {
  const tsCompilerOptions = { ...compilerOptions, ...tsConfigOverride };

  const sources = new Map();
  for (const fileName of Object.keys(tsSources)) {
    sources.set(join(tsCompilerOptions.rootDir, fileName), tsSources[fileName]);
  }

  const { program, host: tsHost } = createProgramAndHost(sources, tsCompilerOptions);
  // expectDiagnosticsEmpty(ts.getPreEmitDiagnostics(program));

  const tsickleHost = {
    es5Mode: true,
    googmodule: false,
    convertIndexImportShorthand: true,
    transformDecorators: true,
    transformTypesToClosure: true,
    logWarning: _diag => {},
    shouldSkipTsickleProcessing: _fileName => false,
    shouldIgnoreWarningsForPath: () => false,
    pathToModuleName: (context, importPath) => {
      importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
      if (importPath[0] === '.') importPath = join(dirname(context), importPath);
      return importPath.replace(/\/|\\/g, '.');
    },
    fileNameToModuleId: fileName => fileName.replace(/^\.\//, ''),
    ...tsickleHostOverride,
    options: tsCompilerOptions,
    moduleResolutionHost: tsHost,
  };

  const jsSources = {};

  tsickle.emit(
    program,
    tsickleHost,
    (fileName, data) => {
      jsSources[relative(tsCompilerOptions.rootDir, fileName)] = data;
    },
    /* sourceFile */ undefined,
    /* cancellationToken */ undefined,
    /* emitOnlyDtsFiles */ undefined,
    customTransformers
  );
  return jsSources;
}

async function start() {
  const tsSources = {
    'index.ts': fs.readFileSync(resolve('src/index.ts'), { encoding: 'utf8' }),
  };

  const jsSources = emitWithTsickle(
    tsSources,
    undefined,
    {
      shouldSkipTsickleProcessing: () => false,
    },
    {
      beforeTs: []
    }
  );

  for (const path of Object.keys(jsSources)) {
    await fsExtra.ensureDir(resolve('dist/closure', dirname(path)));
    const outPath = resolve('dist/closure', path);
    fs.writeFileSync(outPath, jsSources[path], { encoding: 'utf8' });
  }
}

start();
