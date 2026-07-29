import { test, expect } from "@playwright/test";
import { MailpitHelper } from "./utils/mailpit";
import {
  generateRandomEmail,
  generateRandomPassword,
} from "./utils/auth-helpers";

test.describe("认证流程测试", () => {
  // 设置为串行执行
  test.describe.configure({ mode: "serial" });

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

  test("3. 未验证邮箱时登录", async ({ page }) => {
    // 仅注册不验证邮箱
    await page.goto("/auth/register");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill("input#confirmPassword", testPassword);
    await page.click('button[type="submit"]');

    // 注册完成后，不验证邮箱直接点击"返回登录"按钮
    await Promise.all([
      page.waitForURL("/auth/login"), // 先设置监听器
      page.click('a[href="/auth/login"]'), // 然后触发点击
    ]);

    // 验证已经跳转到登录页面
    await expect(page).toHaveURL("/auth/login");

    // 登录
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 因为未验证所以断言没有跳转至主页面
    await expect(page).toHaveURL("/auth/login");
    // 随后显示重新验证提示
    await expect(
      page.locator(`text=我们将向 ${testEmail} 重新发送验证邮件。`)
    ).toBeVisible();
    // 直接清理掉注册邮件
    // await mailpit.clearAllEmails();

    // 点击"确认发送"按钮
    await page.getByRole("button", { name: "确认发送" }).click();

    // 1. 验证按钮变为"发送中..."（禁用状态）
    await expect(page.getByRole("button", { name: "发送中..." })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "发送中..." })
    ).toBeDisabled();

    // 2. 等待按钮恢复为"确认发送"（表示操作完成）
    await expect(page.getByRole("button", { name: "确认发送" })).toBeVisible();
    await expect(page.getByRole("button", { name: "确认发送" })).toBeEnabled();

    // 3. 现在断言成功提示（此时 resendState 已经更新）
    await expect(page.locator("text=验证邮件已重新发送！请查收")).toBeVisible();

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

    // 登录
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 验证登录成功，跳转到首页
    await expect(page).toHaveURL("/");
  });

  test("4. 忘记密码", async ({ page }) => {
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
    let email = await mailpit.waitForEmail(testEmail);

    // 6. 提取验证链接
    const verificationLink = mailpit.extractVerificationLink(email);
    expect(verificationLink).toBeTruthy();

    // 7. 点击验证链接
    await page.goto(verificationLink!);

    // 8. 验证邮箱验证成功，跳转到登录页
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator("text=邮箱验证成功！请登录")).toBeVisible();

    // 点击忘记密码
    await page.getByText("忘记密码？").click();

    // 断言跳转到忘记密码页面
    await expect(page).toHaveURL(/\/auth\/forgot-password/);

    // 填写注册邮箱
    await page.fill('input[name="email"]', testEmail);

    // 点击"发送重置链接"按钮
    await page.getByRole("button", { name: "发送重置链接" }).click();
    // 断言提示成功
    await expect(
      page.getByText("重置链接已发送到你的邮箱，请查收")
    ).toBeVisible();

    // 5. 在 Mailpit 中查找验证邮件
    email = await mailpit.waitForEmail(testEmail);

    // 6. 提取重置密码链接
    const resetPasswordLink = mailpit.extractResetLink(email);
    expect(resetPasswordLink).toBeTruthy();

    // 7. 点击重置密码链接
    await page.goto(resetPasswordLink!);

    // 断言跳转到重置密码页面
    await expect(page).toHaveURL(/\/auth\/reset-password/);

    // 再生成一个新密码
    const testNewPassword = generateRandomPassword();

    // 填写新密码
    await page.fill("input#password", testNewPassword);
    await page.fill("input#confirmPassword", testNewPassword);

    // 点击"发送重置链接"按钮
    await page.getByRole("button", { name: "重置密码" }).click();

    // 重置密码成功，断言跳转回登录页
    await expect(page).toHaveURL(/\/auth\/login/);

    // 使用新密码登录
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testNewPassword);
    await page.click('button[type="submit"]');

    // 验证登录成功，跳转到首页
    await expect(page).toHaveURL("/");
  });
});
