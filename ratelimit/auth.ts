// ratelimit/auth.ts
import { rateLimit, RateLimitResult } from "@/ratelimit/base";
import { getClientIP } from "@/ratelimit/utils";

const AUTH_KEY = "auth";

function buildAuthKey(type: string, identifier: string): string {
  return `${AUTH_KEY}:${type}:${identifier}`;
}

// 利用邮箱和IP限流
async function rlAuthByIPEmail(
  email: string,
  type: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const ip = await getClientIP();
  const identifier = `${ip}:${email.toLowerCase()}`;
  const key = buildAuthKey(type, identifier);

  return rateLimit({
    key,
    limit: limit,
    windowMs: windowMs,
  });
}

// 利用CUID限流
async function rlAuthByCUID(
  cuid: string,
  type: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = buildAuthKey(type, cuid);
  return rateLimit({
    key,
    limit: limit,
    windowMs: windowMs,
  });
}

// 登录限流（自动获取 IP）
export async function rlLogin(email: string): Promise<RateLimitResult> {
  return rlAuthByIPEmail(email, "login", 5, 15 * 60 * 1000);
}

// 忘记密码限流
export async function rlForgotPassword(
  email: string
): Promise<RateLimitResult> {
  return rlAuthByIPEmail(email, "forgotPassword", 5, 15 * 60 * 1000);
}

// 注册限流
export async function rlRegister(email: string): Promise<RateLimitResult> {
  return rlAuthByIPEmail(email, "register", 5, 15 * 60 * 1000);
}

// 重发验证邮件限流
export async function rlResendVerification(
  email: string
): Promise<RateLimitResult> {
  return rlAuthByIPEmail(email, "resendVerification", 5, 15 * 60 * 1000);
}

// 换绑邮箱限流
export async function rlChangeEmail(cuid: string): Promise<RateLimitResult> {
  return rlAuthByCUID(cuid, "changeEmail", 5, 15 * 60 * 1000);
}

// 修改密码限流
export async function rlChangePassword(cuid: string): Promise<RateLimitResult> {
  return rlAuthByCUID(cuid, "changePassword", 5, 15 * 60 * 1000);
}
