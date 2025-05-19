import path from "path";

const sharedConfig = {
  preset: "ts-jest/presets/js-with-ts-esm",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^config/(.*)\\.js$": path.resolve("./app/config/$1.ts"),
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css|scss|sass|less)$": "<rootDir>/unit-test/__mocks__/styleMock.cjs",
    "\\.(svg|png|jpg|jpeg|gif|webp|avif)$":
      "<rootDir>/unit-test/__mocks__/svgMock.cjs",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: path.resolve("tsconfig.json"),
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@testing-library/jest-dom)/)",
    "\\.js$",
  ],
};

export default {
  globals: {
    "ts-jest": {
      tsconfig: path.resolve("tsconfig.json"),
    },
  },
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["<rootDir>/unit-test/**/*.test.ts"],
      ...sharedConfig,
    },
    {
      displayName: "dom",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/ui-test/**/*.test.tsx"],
      setupFilesAfterEnv: [
        "@testing-library/jest-dom",
        "<rootDir>/ui-test/setup.ts",
      ],
      ...sharedConfig,
    },
  ],
};
