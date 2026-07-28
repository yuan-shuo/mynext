import { test, expect } from "@playwright/test";

test("验证数据库配置", async () => {
  expect(process.env.DATABASE_URL).toBeDefined();
});

test("验证Redis配置", async () => {
  expect(process.env.REDIS_HOST).toBeDefined();
  expect(process.env.REDIS_PORT).toBeDefined();
  expect(process.env.REDIS_DB).toBeDefined();
});

test("验证认证配置", async () => {
  expect(process.env.AUTH_SECRET).toBeDefined();
  expect(process.env.AUTH_URL).toBeDefined();
});

test("验证JWT配置", async () => {
  expect(process.env.SESSION_MAX_AGE).toBeDefined();
});

test("验证邮件配置", async () => {
  expect(process.env.SMTP_HOST).toBeDefined();
  expect(process.env.SMTP_PORT).toBeDefined();
  expect(process.env.EMAIL_FROM).toBeDefined();
});
