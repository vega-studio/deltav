import path from "path";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: "jsdom",
  testRegex: path.resolve("(unit-test|ui|test|app|utils)/.*.test.ts$"),
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  collectCoverageFrom: [path.resolve("(ui|app|utils)/**/*.{ts,tsx}")],
  coverageReporters: ["clover", "json-summary", "lcov", "text-summary"],
};
