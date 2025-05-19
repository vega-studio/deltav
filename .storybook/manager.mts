import { addons } from "@storybook/manager-api";

import THEME from "./theme.mts";

addons.setConfig({
  theme: THEME,
});
