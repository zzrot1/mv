import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);

// Vite needs a newer esbuild than the app's orval, so npm keeps the Vite-based
// Storybook packages in this workspace while the Storybook core sits in the root
// node_modules. Absolute paths let the core find them wherever they are.
function getAbsolutePath(packageName: string) {
  return dirname(require.resolve(join(packageName, "package.json")));
}

const config: StorybookConfig = {
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
