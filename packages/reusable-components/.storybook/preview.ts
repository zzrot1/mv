import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    // Every story is also an accessibility test: an axe violation fails it.
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default preview;
