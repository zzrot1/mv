import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const STORYBOOK_COVERAGE_REPORTER = "@storybook/addon-vitest/internal/coverage-reporter";

// Storybook's "Run component tests" adds its coverage reporter by package name,
// and Vitest 5 can't load it: the loader sits in the root node_modules, out of
// reach of this workspace's addon, and it only accepts a default export while
// the addon exports `module.exports`. The local wrapper fixes both.
function resolveStorybookCoverageReporter(): Plugin {
  return {
    configureVitest({ vitest }) {
      for (const reporter of vitest.config.coverage.reporter) {
        if (Array.isArray(reporter) && reporter[0] === STORYBOOK_COVERAGE_REPORTER) {
          (reporter as [string, unknown])[0] = path.join(
            dirname,
            ".storybook/storybook-coverage-reporter.mjs",
          );
        }
      }
    },
    name: "resolve-storybook-coverage-reporter",
  };
}

// A fresh object per project: Vitest writes each instance's project name onto it.
const browser = () => ({
  enabled: true,
  headless: true,
  instances: [{ browser: "chromium" as const }],
  provider: playwright({}),
  viewport: { height: 900, width: 1280 },
});

// Two projects, both in a real Chromium:
// - "unit": the *.test.ts(x) files in each area's tests/ folder;
// - "storybook": every story, with its `play` function and the accessibility check.
// Coverage is measured on the library source only.
export default defineConfig({
  plugins: [resolveStorybookCoverageReporter()],
  test: {
    coverage: {
      exclude: ["src/**/stories/**", "src/**/*.stories.tsx", "src/**/*.test.{ts,tsx}"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    projects: [
      {
        extends: true,
        plugins: [react()],
        test: {
          browser: browser(),
          include: ["src/**/*.test.{ts,tsx}"],
          name: "unit",
          setupFiles: [path.join(dirname, ".storybook/vitest.setup.ts")],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: { browser: browser(), name: "storybook" },
      },
    ],
  },
});
