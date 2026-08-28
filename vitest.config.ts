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
      /*
        Raised from the 5s default.

        A handful of tests type a URL into the lesson form a character at a time and then wait out
        the editor's 400ms debounce. Each takes about half a second on its own, and the suite runs
        its files in parallel — so under load they drift past a 5s budget and fail for want of a
        scheduler slot rather than for anything about the code. Since these are the tests that cover
        the YouTube/Vimeo regression path, a flaky timeout there is a failure everyone learns to
        ignore, which is worse than a slower ceiling.
      */
      testTimeout: 20_000,
    },
  }),
);
