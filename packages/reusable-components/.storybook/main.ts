import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);

function getAbsolutePath(packageName: string) {
  return dirname(require.resolve(join(packageName, "package.json")));
}

const config: StorybookConfig = {
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  core: { disableTelemetry: true },
  framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
