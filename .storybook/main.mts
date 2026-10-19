import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

/** Repository root, resolved from this config file's own directory. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.resolve(ROOT, "ui");

const CONFIG: StorybookConfig = {
  stories: [
    { directory: UI, files: "**/*.mdx" },
    { directory: UI, files: "**/*.stories.@(js|jsx|ts|tsx)" },
    { directory: UI, files: "**/*.bugs.@(js|jsx|ts|tsx)" },
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: [
    path.resolve(ROOT, "ui/assets"),
    path.resolve(ROOT, "ui/stories/assets"),
  ],
  docs: {
    defaultName: "Documentation",
  },
  typescript: {
    // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
    reactDocgen: "react-docgen",
    check: false,
  },
};

export default CONFIG;
