import { vi } from "vitest";

/**
 * Minimal WebExtensions and clipboard mocks for unit tests.
 * Tests override return values per case via mockResolvedValue / mockImplementation.
 */
globalThis.browser = {
  tabs: {
    query: vi.fn().mockResolvedValue([]),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  runtime: {
    openOptionsPage: vi.fn().mockResolvedValue(undefined),
    getURL: vi.fn((path) => `moz-extension://test/${path}`),
  },
};

if (!globalThis.navigator) {
  globalThis.navigator = {};
}
Object.defineProperty(globalThis.navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  configurable: true,
});
