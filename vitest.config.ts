import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

/**
 * Test configuration, kept beside the build config rather than inside it.
 *
 * It reuses `vite.config.ts` wholesale — the `@` alias in particular — so a module resolves the
 * same way under test as it does in the app, and a passing test cannot be passing against a
 * different import graph than the one that ships.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // The video work is about players, iframes and postMessage, none of which exist in Node.
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
    },
  }),
);
