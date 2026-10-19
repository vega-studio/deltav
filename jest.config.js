import path from "path";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  // Browser suite: globalSetup starts the test-only Vite server over
  // test/fixtures; each test file drives its own headless Chromium.
  globalSetup: path.resolve("test/harness/global-setup.mjs"),
  globalTeardown: path.resolve("test/harness/global-teardown.mjs"),
  testRegex: path.resolve("test/.*\\.test\\.ts$"),
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
        tsconfig: path.resolve("tsconfig.json"),
      },
    ],
  },
  // Each worker owns one browser.
  maxWorkers: 2,
  testTimeout: 60000,
};
