import React from "react";
import { StoryFn } from "@storybook/react";
import { OldDemos } from "../old-demos/old-demos";

export default {
  title: "Deltav/OldDemos/OldDemos",
  args: {},
  argTypes: {},
};

const Template = () => () => (
  <OldDemos />
);

export const Basic: StoryFn = Template().bind({});
