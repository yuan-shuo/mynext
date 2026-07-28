import { test, expect } from "@playwright/test";
import { MailpitHelper } from "./utils/mailpit";
import {
  generateRandomEmail,
  generateRandomPassword,
} from "./utils/auth-helpers";

test.describe("认证流程测试", () => {
  let mailpit: MailpitHelper;
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(async ({ request }) => {
    mailpit = new MailpitHelper(request);
    await mailpit.clearAllEmails();
    testEmail = generateRandomEmail();
    testPassword = generateRandomPassword();
  });

  test("1. 成功注册并验证邮箱", async ({ page }) => {
    // 1. 访问注册页面
    await page.goto("/auth/register");
    await expect(page).toHaveURL(/\/auth\/register/);

    // 2. 填写注册表单
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill("input#confirmPassword", testPassword);

    // 3. 提交注册
    await page.click('button[type="submit"]');

    // 4. 验证跳转到验证邮件发送页面
    await expect(page.locator("text=验证邮件已发送")).toBeVisible();
    await expect(page.locator(`strong:has-text("${testEmail}")`)).toBeVisible();

    // 5. 在 Mailpit 中查找验证邮件
    const email = await mailpit.waitForEmail(testEmail);

    // 6. 提取验证链接
    const verificationLink = mailpit.extractVerificationLink(email);
    expect(verificationLink).toBeTruthy();

    // 7. 点击验证链接
    await page.goto(verificationLink!);

    // 8. 验证邮箱验证成功，跳转到登录页
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator("text=邮箱验证成功！请登录")).toBeVisible();
  });

  test("2. 使用正确凭证登录", async ({ page }) => {
    // 先注册并验证用户
    await page.goto("/auth/register");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill("input#confirmPassword", testPassword);
    await page.click('button[type="submit"]');

    const email = await mailpit.waitForEmail(testEmail);
    const link = mailpit.extractVerificationLink(email);
    expect(link).toBeTruthy();

    await page.goto(link!);
    await expect(page.locator("text=邮箱验证成功！请登录")).toBeVisible();

    // 登录
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 验证登录成功，跳转到首页
    await expect(page).toHaveURL("/");
  });
});
