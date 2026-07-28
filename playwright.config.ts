import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// 加载 .env.test
const envFile = process.env.ENV_FILE || ".env.test";
dotenv.config({ path: path.resolve(__dirname, envFile) });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.AUTH_URL || "http://localhost:3000",
    trace: "on-first-retry",
    // 可以在这里添加更多的测试环境变量
    extraHTTPHeaders: {
      "X-Test-Environment": "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: process.env.AUTH_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // 传递环境变量给 Next.js
      ...process.env,
      NODE_ENV: "test",
    },
  },
});
