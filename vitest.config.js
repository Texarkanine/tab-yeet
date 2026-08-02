import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/**/*.js",
        "popup/**/*.js",
        "options/**/*.js",
        "scripts/**/*.js",
        "automation-scripts/**/*.js",
      ],
      exclude: [
        "test/**",
        "node_modules/**",
        "build/**",
        "web-ext-artifacts/**",
        "coverage/**",
      ],
    },
  },
});
