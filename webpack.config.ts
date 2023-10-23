import CircularDependencyPlugin from "circular-dependency-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import fs from "fs-extra";
import url from "url";
import Webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { resolve } from "path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

/**
 * Some steps in creating the webpack config are asynchronous. Our build system
 * supports a config object OR a promise that returns a config object.
 */
const promise = new Promise(async (resolveConfig) => {
  console.warn("NODE_ENV:", process.env.NODE_ENV);
  console.warn(
    "PRETTIER LOADER:",
    resolve(process.env.PRETTIERJSPATH || "", "prettier-loader.js")
  );
  console.warn("BUILD ENV:", process.env.BUILD_ENV);

  const IS_RELEASE = process.env.NODE_ENV === "release";
  const IS_PRODUCTION = process.env.NODE_ENV === "production" || IS_RELEASE;
  const IS_MOCK = !IS_PRODUCTION && process.env.BUILD_ENV === "mock";
  const IS_UNIT_TESTS = process.env.NODE_ENV === "unit-test";
  const IS_DEVELOPMENT =
    process.env.NODE_ENV === void 0 ||
    process.env.NODE_ENV === "development" ||
    IS_UNIT_TESTS;
  const MODE =
    process.env.MODE || IS_RELEASE || IS_PRODUCTION
      ? "production"
      : "development";

  const babelOptions = fs.readJSONSync(resolve(".babelrc.json"));

  const plugins: any[] = [new ESLintPlugin({})];
  let externals = [];
  let library;
  let libraryTarget;

  if (IS_DEVELOPMENT) {
    plugins.push(
      new CircularDependencyPlugin({
        exclude: /\bapp(.*?)server\b|\bnode_modules\b/,
        failOnError: true,
      })
    );

    if (process.env.DEBUG_PACKAGE === "true") {
      plugins.push(new BundleAnalyzerPlugin());
    }

    libraryTarget = "umd";
  }

  if (IS_MOCK) {
    // Swap out the environment configuration based build environment
    plugins.push(
      new Webpack.NormalModuleReplacementPlugin(/(.*)env/, function (resource) {
        // ONLY replace anything reference "env" explicitly to get changed to prod
        if (resource.request.substring(resource.request.length - 3) === "env") {
          const old = resource.request;
          resource.request += `.${process.env.BUILD_ENV}`;
          console.warn(
            "SWAP FOR BUILD ENV RESOURCE",
            old,
            "->",
            resource.request
          );
        }
      })
    );
  } else if (IS_PRODUCTION) {
    // List our external libs for the library generation so they do
    // not get bundled into ours
    externals = [];

    // Swap out the environment configuration based build environment
    plugins.push(
      new Webpack.NormalModuleReplacementPlugin(/(.*)env/, function (resource) {
        // ONLY replace anything reference "env" explicitly to get changed to prod
        if (resource.request.substring(resource.request.length - 3) === "env") {
          const old = resource.request;
          resource.request += `.${process.env.BUILD_ENV}`;
          console.warn(
            "SWAP FOR BUILD ENV RESOURCE",
            old,
            "->",
            resource.request
          );
        }
      })
    );

    // We should minify and mangle our distribution for npm
    console.warn("Production plugins in use...");
  }

  let entry = "lib";
  if (IS_DEVELOPMENT) entry = "test";
  if (IS_UNIT_TESTS) entry = "unit-test";

  let path = resolve(__dirname, "build");
  if (IS_PRODUCTION) path = resolve(__dirname, "dist");
  if (IS_UNIT_TESTS) path = resolve(__dirname, "unit-test", "build");

  const config: Webpack.Configuration = {
    devtool: "source-map",
    entry,
    externals,
    mode: MODE,

    module: {
      rules: [
        {
          test: /\.tsx?/,
          use: [
            { loader: "babel-loader", options: babelOptions },
            {
              loader: "ts-loader",
              options: { transpileOnly: true },
            },
          ],
        },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
        { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
        {
          test: /\.html$/,
          use: { loader: "file-loader", options: { name: "[name].html" } },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: "asset/resource",
        },
        {
          test: /\.[fv]s$/,
          use: IS_PRODUCTION
            ? ["compress-shader-loader"]
            : { loader: "raw-loader", options: { esModule: false } },
        },
        { test: /\.md$/, use: ["raw-loader"] },
        { test: /\.js$/, use: ["source-map-loader"] },
        {
          test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          use: "base64-inline-loader",
        },
        {
          test: /\.(mp4|mov)$/,
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        },
      ],
    },

    output: {
      library,
      libraryTarget,
      path,
      filename: "index.js",
    },

    plugins,

    resolve: {
      modules: [".", "./node_modules", "./ui", "./app", "./util"],
      extensions: [".ts", ".tsx", ".js", ".json"],
      extensionAlias: {
        ".js": [".ts", ".js", ".tsx", ".jsx"],
        ".mjs": [".mts", ".mjs"],
      },
    },

    resolveLoader: {
      modules: ["node_modules", "loaders"],
    },
  };

  // We now take our initial configuration and bundle our environment file by
  // itself so we can utilize it's values for the build process. We perform the
  // bundle separately to get around ESM and CommonJS issues that arise from
  // devops being ESM and targets being ESM or CommonJS.
  const envPath = resolve(
    `./app/config/env${
      process.env.BUILD_ENV ? `.${process.env.BUILD_ENV}` : ""
    }.ts`
  );

  if (fs.existsSync(envPath)) {
    // Now we can import ENV from the bundles
    const { ENV } = await import(envPath);

    // This configuration will allow for ENV property picking within the HTML
    // file. Simply use template syntax with ${property name} to reference the
    // property in the HTML. This will NOT work for methods on the ENV nor
    // will it reference nested properties (prop.prop will not work, only prop
    // will work).
    const replaceLoader = {
      test: /index\.html$/,
      loader: "string-replace-loader",
      options: {
        search: /\$\{([^\}]*)\}/g,
        replace: (match, p1) => {
          const value = ENV[p1];
          if (value !== void 0) return value;
          return match;
        },
      },
    };

    config.module?.rules?.push(replaceLoader);
  }

  resolveConfig(config);
});

export default promise;
