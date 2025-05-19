import type { Preview } from "@storybook/react";

const preview: Preview = {
  // ...rest of preview
  //👇 Enables auto-generated documentation for all stories
  tags: ["autodocs"],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
