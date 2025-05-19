import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import node from "eslint-plugin-node";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["bin/lib/template/*", "src/util/normalize-wheel/*.js"],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "simple-import-sort": simpleImportSort,
      node,
      prettier,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-magic-numbers": [0],

      "no-console": [
        2,
        {
          allow: ["warn", "error"],
        },
      ],

      curly: [2, "multi-line"],
      "no-debugger": 2,
      "no-empty": 2,
      "no-eval": 2,
      "no-unsafe-finally": 2,
      "use-isnan": 2,
      "linebreak-style": [2, "unix"],

      "prefer-const": [
        2,
        {
          destructuring: "all",
        },
      ],

      "object-literal-sort-keys": 0,
      "new-parens": 2,
      "no-irregular-whitespace": 2,
      "object-literal-key-quotes": [0, "consistent-as-needed"],
      "prefer-template": 2,
      "no-async-promise-executor": 0,
      "no-useless-escape": 0,
      "require-yield": 0,
      "require-await": 0,
      "require-jsdoc": 0,

      "simple-import-sort/imports": "error",

      "node/file-extension-in-import": [
        "error",
        "always",
        {
          tryExtensions: [".js", ".json"],
        },
      ],

      "@typescript-eslint/no-non-null-assertion": 0,
      "@typescript-eslint/no-empty-interface": 0,
      "@typescript-eslint/no-empty-function": 0,

      "@typescript-eslint/no-unused-vars": [
        2,
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/no-misused-new": 2,

      "@typescript-eslint/array-type": [
        2,
        {
          default: "array",
          readonly: "array",
        },
      ],

      "@typescript-eslint/no-restricted-types": [
        2,
        {
          types: {
            Number: "Use number instead",
            Object: "Use object instead",
            String: "Use string instead",
          },
        },
      ],

      "prettier/prettier": [
        2,
        {
          trailingComma: "es5",
        },
        {
          usePrettierrc: false,
        },
      ],
    },
  },
  {
    files: ["bin/lib/template/**/*", "native/**/*"],

    rules: {
      "node/file-extension-in-import": ["off"],
    },
  },
];
