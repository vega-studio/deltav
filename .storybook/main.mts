import type { StorybookConfig } from "@storybook/react-vite";
import fs from "fs";
import path from "path";

function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

console.warn("PROJECT ROOT:", process.env.PROJECT_ROOT);
const NODE_MODULES_STORIES = (process.env.NODE_MODULES_STORIES || "")
  .split(",")
  .filter(Boolean);

const CONFIG: StorybookConfig = {
  stories: [
    {
      directory: path.resolve(process.env.PROJECT_ROOT || "", "./ui"),
      files: "**/*.mdx",
    },
    {
      directory: path.resolve(process.env.PROJECT_ROOT || "", "./ui"),
      files: "**/*.stories.@(js|jsx|ts|tsx)",
    },
    {
      directory: path.resolve(process.env.PROJECT_ROOT || "", "./ui"),
      files: "**/*.bugs.@(js|jsx|ts|tsx)",
    },
    ...NODE_MODULES_STORIES.map((moduleName) => {
      const moduleStories = path.resolve(
        process.env.PROJECT_ROOT || "",
        `./node_modules/${moduleName}/dist/stories`
      );
      if (fs.existsSync(moduleStories)) {
        return {
          directory: path.resolve(moduleStories),
          files: "**/*.stories.@(js|jsx|ts|tsx)",
        };
      } else {
        console.warn(
          `The stories for installed dependency ${moduleName} were not found.`
        );
      }
    }),
  ].filter(isDefined),
  addons: [
    "@storybook/preset-scss",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: [
    path.resolve(process.env.PROJECT_ROOT || "", "./ui/assets"),
    path.resolve(process.env.PROJECT_ROOT || "", "./ui/stories/assets"),
  ],
  babel: async (_options) => {
    const babelConfig = fs.readFileSync(
      path.resolve(process.env.PROJECT_ROOT || "", ".babelrc.json"),
      "utf8"
    );
    return JSON.parse(babelConfig);
  },
  viteFinal: async (config) => {
    // Vite adjustments for projects
    return config;
  },
  docs: {
    defaultName: "Documentation",
  },
  typescript: {
    // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
    reactDocgen: "react-docgen",
    check: false,
  },
};

console.warn("STORIES FROM", CONFIG.stories);
console.warn("\\\\".replace("\\\\", "\\"));
export default CONFIG;
