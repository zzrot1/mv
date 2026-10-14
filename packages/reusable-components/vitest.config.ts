import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Every story is a test: it renders in Chromium, runs its `play` function and
// the accessibility check. Coverage is measured on the library source only.
export default defineConfig({
  test: {
    coverage: {
      exclude: ["src/**/stories/**", "src/**/*.stories.tsx"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright({}),
            viewport: { height: 900, width: 1280 },
          },
          name: "storybook",
        },
      },
    ],
  },
});
