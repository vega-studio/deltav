import path from "path";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // testEnvironment: "jsdom",
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  testRegex: path.resolve("(unit-test|ui|test|app|utils)/.*.test.ts$"),
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^config/(.*)\\.js$": path.resolve("./app/config/$1.ts"),
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
        tsConfig: path.resolve("tsconfig.json"),
      },
    ],
  },
  testTimeout: 20000,
};
