import { defineConfig, devices } from "@playwright/test";

// Note: several low ports on this host (3000, 3010, 3100) are captured by
// an unrelated WSL/Docker relay regardless of what's actually listening,
// which silently serves a different app and makes tests pass/fail against
// the wrong server. This port was verified free before picking it.
const PORT = 4137;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Serial, single worker: there is one shared local Supabase instance and
  // no per-test DB reset/transaction isolation in V1, so concurrent runs
  // race real auth/session state against each other. Trade simplicity for
  // determinism rather than building test-DB isolation for its own sake.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
